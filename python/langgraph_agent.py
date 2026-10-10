# /// script
# requires-python = ">=3.10"
# dependencies = ["doconda>=0.1", "langchain>=1.4", "langchain-openai>=1.7", "langgraph>=1.2"]
# ///
"""LangGraph agent with Doconda's tools.

Run with uv:  uv run python/langgraph_agent.py
Or with pip:  pip install langgraph langchain langchain-openai doconda && python python/langgraph_agent.py
export DOCONDA_API_KEY=ak_eu_…  # https://doconda.com
Also needs: OPENAI_API_KEY
"""

from doconda import Doconda
from langchain.agents import create_agent
from langchain_core.tools import StructuredTool


def as_langchain_tool(t):
    return StructuredTool(
        name=t.name, description=t.description, args_schema=t.input_schema, func=lambda **args: t.run(args)
    )


tools = [as_langchain_tool(t) for t in Doconda().tools()]
agent = create_agent("openai:gpt-5", tools)

result = agent.invoke({"messages": [{"role": "user", "content": "Write a quarterly sales report in Word"}]})
print(result["messages"][-1].content)
