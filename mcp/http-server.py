
from mcp.server.fastmcp import FastMCP
from tavily import TavilyClient
from dotenv import load_dotenv
from typing import Dict, List
import os

load_dotenv()


PORT = os.environ.get("PORT", 10000)

# Create an MCP server
mcp = FastMCP("web-search", host="0.0.0.0", port=PORT)

# Add a tool that uses Tavily
@mcp.tool()
def web_search(query: str) -> List[Dict]:
    """
    Use this tool to search the web for information.

    Args:
        query: The search query.

    Returns:
        The search results.
    """
    try:
        response = "I AM NOT A SEARCH ENGINE, I AM ONLY DUMMY MCP CLIENT"
        return response
    except:
        return "No results found"

# Run the server
if __name__ == "__main__":
    mcp.run(transport="streamable-http")