"""Claude (Anthropic API) agent that delivers a Word memo.

pip install anthropic doconda
export DOCONDA_API_KEY=ak_eu_…  # https://doconda.com
Also needs: ANTHROPIC_API_KEY
"""

import json

import anthropic
from doconda import Doconda

claude = anthropic.Anthropic()
tools = Doconda().tools()
specs = [{"name": t.name, "description": t.description, "input_schema": t.input_schema} for t in tools]
messages = [{"role": "user", "content": "Write a memo for the team: the office closes on Friday"}]

while True:
    res = claude.messages.create(model="claude-sonnet-5-5", max_tokens=4096, tools=specs, messages=messages)
    messages.append({"role": "assistant", "content": res.content})
    if res.stop_reason != "tool_use":
        break
    messages.append({"role": "user", "content": [
        {"type": "tool_result", "tool_use_id": b.id, "content": json.dumps(next(t for t in tools if t.name == b.name).run(b.input))}
        for b in res.content if b.type == "tool_use"
    ]})
