"""OpenAI Responses API with Doconda's remote MCP server: no SDK, the model calls Doconda directly.

pip install openai
export DOCONDA_API_KEY=ak_eu_…  # https://doconda.com
Also needs: OPENAI_API_KEY
"""

import os

from openai import OpenAI

response = OpenAI().responses.create(
    model="gpt-5",
    input="Make an Excel with the budget for a 3-day team offsite for 20 people",
    tools=[
        {
            "type": "mcp",
            "server_label": "doconda",
            "server_url": "https://api.eu.doconda.com/mcp",
            "headers": {"Authorization": f"Bearer {os.environ['DOCONDA_API_KEY']}"},
            "require_approval": "never",
        }
    ],
)
print(response.output_text)
