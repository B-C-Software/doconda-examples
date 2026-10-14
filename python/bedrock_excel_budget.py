# /// script
# requires-python = ">=3.10"
# dependencies = ["boto3>=1.43", "doconda>=0.2"]
# ///
"""Amazon Bedrock (Converse API) agent that delivers an Excel budget.

Run with uv:  uv run python/bedrock_excel_budget.py
Or with pip:  pip install boto3 doconda && python python/bedrock_excel_budget.py
export DOCONDA_API_KEY=ak_eu_…  # https://doconda.com
Also needs: BEDROCK_MODEL_ID, AWS credentials and region (AWS_REGION)
"""

import json
import os

import boto3
from doconda import Doconda

bedrock = boto3.client("bedrock-runtime")
tools = Doconda().tools()
tool_config = {
    "tools": [
        {"toolSpec": {"name": t.name, "description": t.description, "inputSchema": {"json": t.input_schema}}}
        for t in tools
    ]
}
messages = [{"role": "user", "content": [{"text": "Make an Excel with the event budget"}]}]

while True:
    res = bedrock.converse(modelId=os.environ["BEDROCK_MODEL_ID"], messages=messages, toolConfig=tool_config)
    message = res["output"]["message"]
    messages.append(message)
    if res["stopReason"] != "tool_use":
        break
    results = []
    for block in message["content"]:
        if "toolUse" in block:
            use = block["toolUse"]
            out = next(t for t in tools if t.name == use["name"]).run(use["input"])
            results.append({"toolResult": {"toolUseId": use["toolUseId"], "content": [{"text": json.dumps(out)}]}})
    messages.append({"role": "user", "content": results})

print("".join(b["text"] for b in message["content"] if "text" in b))
