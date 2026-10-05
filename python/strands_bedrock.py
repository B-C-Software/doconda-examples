"""AWS Strands agent on Bedrock with Doconda's tools.

pip install strands-agents doconda
export DOCONDA_API_KEY=ak_eu_…  # https://doconda.com
Also needs: BEDROCK_MODEL_ID, AWS credentials
"""

import json
import os

from doconda import Doconda
from strands import Agent
from strands.models import BedrockModel
from strands.tools import PythonAgentTool


def as_strands_tool(t):
    def run(tool_use, **_):
        out = t.run(tool_use["input"])
        return {"toolUseId": tool_use["toolUseId"], "status": "success", "content": [{"text": json.dumps(out)}]}

    spec = {"name": t.name, "description": t.description, "inputSchema": {"json": t.input_schema}}
    return PythonAgentTool(t.name, spec, run)


agent = Agent(
    model=BedrockModel(model_id=os.environ["BEDROCK_MODEL_ID"]),
    tools=[as_strands_tool(t) for t in Doconda().tools()],
)

agent("Create a 5-slide presentation on our quarterly results")
