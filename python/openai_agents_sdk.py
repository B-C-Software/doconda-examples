# /// script
# requires-python = ">=3.10"
# dependencies = ["doconda>=0.1", "openai-agents>=0.23"]
# ///
"""OpenAI Agents SDK agent with Doconda's tools.

Run with uv:  uv run python/openai_agents_sdk.py
Or with pip:  pip install openai-agents doconda && python python/openai_agents_sdk.py
export DOCONDA_API_KEY=ak_eu_…  # https://doconda.com
Also needs: OPENAI_API_KEY
"""

import asyncio
import json

from agents import Agent, FunctionTool, Runner
from doconda import Doconda


def as_function_tool(t):
    async def invoke(ctx, args: str):
        return json.dumps(await asyncio.to_thread(t.run, json.loads(args)))

    return FunctionTool(
        name=t.name,
        description=t.description,
        params_json_schema=t.input_schema,
        on_invoke_tool=invoke,
        strict_json_schema=False,
    )


agent = Agent(
    name="Documents",
    instructions="Create the documents the user asks for and return their links.",
    model="gpt-5",
    tools=[as_function_tool(t) for t in Doconda().tools()],
)

result = Runner.run_sync(agent, "Write a memo for the team: the office is closed on Friday")
print(result.final_output)
