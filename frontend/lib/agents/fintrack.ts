/**
 * FinTrack Agent - Payout Estimation Logic
 */

export interface FinTrackInput {
  damage_description: string;
  damage_severity?: 'minor' | 'moderate' | 'severe';
  coverage_type?: 'comprehensive' | 'collision' | 'liability';
  deductible?: number;
  photos_uploaded?: boolean;
}

export interface FinTrackOutput {
  damage_total: number;
  deductible: number;
  payout: number;
  confidence: 'Low' | 'Medium' | 'High';
  breakdown: {
    parts: number;
    labor: number;
    paint: number;
    other: number;
  };
  notes: string[];
}

/**
 * Calculate insurance payout based on damage severity
 */
export function calculatePayout(input: FinTrackInput): FinTrackOutput {
  // Determine severity from description if not provided
  let severity = input.damage_severity;
  if (!severity) {
    severity = detectSeverity(input.damage_description);
  }

  // Base damage estimates by severity
  const baseEstimates = {
    minor: { min: 800, max: 1500 },
    moderate: { min: 1500, max: 4000 },
    severe: { min: 4000, max: 8000 }
  };

  const range = baseEstimates[severity];
  const baseDamage = (range.min + range.max) / 2;

  // Adjust based on description keywords
  let multiplier = 1.0;
  const description = input.damage_description.toLowerCase();

  if (description.includes('frame') || description.includes('structural')) {
    multiplier += 0.5;
  }
  if (description.includes('airbag')) {
    multiplier += 0.3;
  }
  if (description.includes('multiple') || description.includes('several')) {
    multiplier += 0.2;
  }

  const damageTotal = Math.round(baseDamage * multiplier);

  // Calculate breakdown
  const breakdown = {
    parts: Math.round(damageTotal * 0.5),
    labor: Math.round(damageTotal * 0.35),
    paint: Math.round(damageTotal * 0.1),
    other: Math.round(damageTotal * 0.05)
  };

  // Apply deductible
  const deductible = input.deductible || 500;
  const payout = Math.max(0, damageTotal - deductible);

  // Determine confidence
  let confidence: 'Low' | 'Medium' | 'High' = 'Medium';
  if (input.photos_uploaded) {
    confidence = 'High';
  } else if (!input.damage_severity) {
    confidence = 'Low';
  }

  // Generate notes
  const notes: string[] = [];
  if (!input.photos_uploaded) {
    notes.push('Upload photos for more accurate estimate');
  }
  if (severity === 'severe') {
    notes.push('Professional inspection recommended');
  }
  if (multiplier > 1.3) {
    notes.push('Significant damage detected - estimate may increase with inspection');
  }

  return {
    damage_total: damageTotal,
    deductible,
    payout,
    confidence,
    breakdown,
    notes
  };
}

/**
 * Detect severity from damage description
 */
function detectSeverity(description: string): 'minor' | 'moderate' | 'severe' {
  const lower = description.toLowerCase();

  // Severe indicators
  const severeKeywords = ['totaled', 'frame', 'structural', 'airbag', 'major', 'extensive', 'severe'];
  if (severeKeywords.some(kw => lower.includes(kw))) {
    return 'severe';
  }

  // Minor indicators
  const minorKeywords = ['scratch', 'dent', 'minor', 'small', 'cosmetic', 'paint'];
  if (minorKeywords.some(kw => lower.includes(kw)) && !lower.includes('multiple')) {
    return 'minor';
  }

  // Default to moderate
  return 'moderate';
}

/**
 * Compare multiple severity scenarios
 */
export function compareEstimates(
  input: FinTrackInput,
  severities: ('minor' | 'moderate' | 'severe')[]
): Record<string, FinTrackOutput> {
  const results: Record<string, FinTrackOutput> = {};

  severities.forEach(severity => {
    results[severity] = calculatePayout({ ...input, damage_severity: severity });
  });

  return results;
}
