from mcp import Client

async with Client.from_stdio() as client:
    result = await client.call_tool("parse_pdf", {"file": "/path/to/file.pdf"})
    print(result)