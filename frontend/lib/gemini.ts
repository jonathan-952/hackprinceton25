/**
 * Gemini API Client for ClaimPilot Chat Assistant
 */

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ClaimContext {
  claim_id: string;
  incident_type: string;
  date: string;
  location: string;
  status: string;
  damages_description: string;
  estimated_damage?: string;
  [key: string]: any;
}

export class GeminiClient {
  private apiKey: string;
  private model: string = 'gemini-2.0-flash-exp';
  private apiUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate system prompt with claim context
   */
  private generateSystemPrompt(claimContext?: ClaimContext): string {
    if (!claimContext) {
      return `You are ClaimPilot AI, a professional insurance claims assistant.
You help users manage their insurance claims with a calm, empathetic, and professional tone.

Your capabilities:
1. Answer questions about insurance claims
2. Help users update claim information
3. Trigger orchestrator agents for specific tasks
4. Explain insurance concepts and next steps

Tone: Professional, calm, empathetic, helpful
Format: Natural conversational responses, not bullet points unless listing options`;
    }

    return `You are ClaimPilot AI, a professional insurance claims assistant. You have access to the following claim data:

CLAIM INFORMATION:
- Claim ID: ${claimContext.claim_id}
- Type: ${claimContext.incident_type}
- Date: ${claimContext.date}
- Location: ${claimContext.location}
- Status: ${claimContext.status}
- Damage Description: ${claimContext.damages_description}
${claimContext.estimated_damage ? `- Estimated Damage: ${claimContext.estimated_damage}` : ''}

Your capabilities:
1. Answer questions about this claim naturally and conversationally
2. Update claim fields when requested (respond with structured data for updates)
3. Trigger orchestrator agents when asked:
   - FinTrack: For damage estimates and payout calculations
   - Repair Advisor: For finding repair shops
   - Claim Drafting: For generating claim documents
   - Compliance Check: For validating claim completeness
4. Explain insurance concepts, payout calculations, and next steps

When users ask you to update information or trigger agents, respond naturally and confirm what you'll do.

Examples:
- User: "Change the location to 123 Main St" → You: "I'll update the incident location to 123 Main St for you."
- User: "Can you estimate the damage?" → You: "I'll run the FinTrack agent to calculate the damage estimate for you."
- User: "Find me repair shops" → You: "I'll search for repair shops near your location."

Tone: Professional, calm, empathetic, helpful
Format: Conversational responses, not bullet points unless listing options`;
  }

  /**
   * Send chat message to Gemini API
   */
  async chat(
    message: string,
    conversationHistory: GeminiMessage[] = [],
    claimContext?: ClaimContext
  ): Promise<{
    response: string;
    action?: 'update_claim' | 'trigger_agent';
    actionData?: any;
  }> {
    try {
      const systemPrompt = this.generateSystemPrompt(claimContext);

      // Build conversation history with system prompt
      const contents: GeminiMessage[] = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I am ClaimPilot AI, ready to assist with insurance claims.' }]
        },
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      const response = await fetch(
        `${this.apiUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Gemini API error');
      }

      const data = await response.json();
      const generatedText = data.candidates[0]?.content?.parts[0]?.text || 'I apologize, but I couldn\'t generate a response. Please try again.';

      // Parse response for actions
      const result: any = {
        response: generatedText
      };

      // Detect if AI wants to trigger an agent
      const lowerResponse = generatedText.toLowerCase();
      if (
        lowerResponse.includes('run the fintrack') ||
        lowerResponse.includes('calculate') ||
        lowerResponse.includes('estimate')
      ) {
        result.action = 'trigger_agent';
        result.actionData = { agent: 'fintrack' };
      } else if (
        lowerResponse.includes('find repair shops') ||
        lowerResponse.includes('search for shops')
      ) {
        result.action = 'trigger_agent';
        result.actionData = { agent: 'repair_advisor' };
      } else if (lowerResponse.includes('draft') || lowerResponse.includes('generate claim')) {
        result.action = 'trigger_agent';
        result.actionData = { agent: 'claim_drafting' };
      } else if (lowerResponse.includes('validate') || lowerResponse.includes('check compliance')) {
        result.action = 'trigger_agent';
        result.actionData = { agent: 'compliance' };
      }

      return result;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        response: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.'
      };
    }
  }

  /**
   * Extract structured data from document text
   */
  async extractClaimData(documentText: string): Promise<any> {
    try {
      const prompt = `Extract structured information from this insurance document:

${documentText}

Extract the following fields in JSON format:
- incident_type (e.g., "Car Accident", "Home Damage", etc.)
- date (incident date in YYYY-MM-DD format)
- location (street address or description)
- description (damage description)
- policy_number (if mentioned)
- claimant_name (if mentioned)
- damages (list of damaged items)
- estimated_amount (if mentioned)

Return ONLY valid JSON, no other text.`;

      const response = await fetch(
        `${this.apiUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to extract claim data');
      }

      const data = await response.json();
      const extractedText = data.candidates[0]?.content?.parts[0]?.text || '{}';

      // Parse JSON from response (may have markdown code blocks)
      const jsonMatch = extractedText.match(/```json\n([\s\S]*?)\n```/) || extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonText);
      }

      return {};
    } catch (error) {
      console.error('Error extracting claim data:', error);
      return {};
    }
  }
}

// Singleton instance
let geminiClient: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn('Gemini API key not found. Chat features will be limited.');
    }
    geminiClient = new GeminiClient(apiKey);
  }
  return geminiClient;
}
