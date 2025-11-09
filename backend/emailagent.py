import pdfplumber
from fastmcp import FastMCP  # or: from mcp.server.fastmcp import FastMCP
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

mcp = FastMCP("insurance")
mcp_with_instructions = FastMCP(
    name="HelpfulAssistant",
    instructions="""
You are HelpfulAssistant, an AI that helps process insurance claim documents.
Your job is to:
1. Extract text from uploaded PDF claims.
2. Summarize the claim in clear, concise language.
3. Highlight key details such as:
   - Claim status (approved, denied, pending)
   - Amount potentially owed
   - Relevant dates or deadlines
4. Use the registered MCP tools when necessary to perform tasks.
5. Respond clearly and helpfully, suitable for an insurance agent or customer support context.
"""
)  


@mcp.tool()
def parse_pdf(file):
    text = ''
    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            text += page.extract_text()
    return text

@mcp.tool()
def summarize_claim(claim_text: str) -> str | None:
    """Generate a short summary of a claim document using OpenAI GPT."""
    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an insurance claims summarization assistant."},
            {"role": "user", "content": f"Summarize the following claim in a few sentences, extract important information such as what may be owed, if the claim was denied, etc.:\n\n{claim_text}"}
        ],
        max_tokens=200
    )
    return response.choices[0].message.content


if __name__ == "__main__":
    # transport="stdio" is easiest for local testing; you can also use http/sse
    mcp.run(transport="stdio")



