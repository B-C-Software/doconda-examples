"""OpenAI (Chat Completions) agent that delivers a Word memo.

pip install openai doconda
export DOCONDA_API_KEY=ak_eu_…  # https://doconda.com
Also needs: OPENAI_API_KEY
"""

import json

from doconda import Doconda
from openai import OpenAI

openai = OpenAI()
tools = Doconda().tools()
specs = [{"type": "function", "function": {"name": t.name, "description": t.description, "parameters": t.input_schema}} for t in tools]
messages = [{"role": "user", "content": "Write a memo for the team: the office closes on Friday"}]

while True:
    message = openai.chat.completions.create(model="gpt-5", messages=messages, tools=specs).choices[0].message
    messages.append(message)
    if not message.tool_calls:
        break
    for call in message.tool_calls:
        out = next(t for t in tools if t.name == call.function.name).run(json.loads(call.function.arguments))
        messages.append({"role": "tool", "tool_call_id": call.id, "content": json.dumps(out)})
