# Doconda examples

Make your AI agent or chatbot **deliver Word (DOCX), PowerPoint (PPTX), Excel (XLSX) and PDF files** — editable, with real styles, reviewed before delivery — instead of maintaining python-docx, python-pptx, openpyxl or templates.

[Doconda](https://doconda.com) is a document API for AI agents. These examples show it on every common stack.

```bash
pip install doconda          # Python
npm install @doconda/sdk     # TypeScript
export DOCONDA_API_KEY=ak_eu_…   # get one at https://doconda.com
```

## Examples

| Stack | Example | What it does |
|---|---|---|
| No agent | [`python/direct_create.py`](python/direct_create.py) | Word from a prompt, Word from Markdown, an Excel budget, review an existing file |
| Amazon Bedrock | [`python/bedrock_excel_budget.py`](python/bedrock_excel_budget.py) | Converse API agent that delivers an Excel budget |
| AWS Strands | [`python/strands_bedrock.py`](python/strands_bedrock.py) | Strands agent on Bedrock that delivers a PowerPoint |
| Google Vertex AI | [`python/vertex_powerpoint.py`](python/vertex_powerpoint.py) | Gemini agent that delivers a PowerPoint |
| Azure OpenAI | [`python/azure_openai_word_report.py`](python/azure_openai_word_report.py) | Azure OpenAI agent that delivers a Word report |
| OpenAI | [`python/openai_word_memo.py`](python/openai_word_memo.py) | Chat Completions agent that delivers a Word memo |
| OpenAI Agents SDK | [`python/openai_agents_sdk.py`](python/openai_agents_sdk.py) | Agents SDK with Doconda as function tools |
| Claude | [`python/claude_word_memo.py`](python/claude_word_memo.py) | Anthropic API agent that delivers a Word memo |
| LangGraph | [`python/langgraph_agent.py`](python/langgraph_agent.py) | LangGraph agent with Doconda's tools |
| Vercel AI SDK | [`typescript/ai-sdk.ts`](typescript/ai-sdk.ts) | AI SDK agent (any model) with Doconda's tools |
| Mastra | [`typescript/mastra.ts`](typescript/mastra.ts) | Mastra agent with Doconda's tools |
| Claude Code, Cursor, Codex, Claude Desktop | [`mcp/`](mcp) | Add Doconda as an MCP server |

Every agent example uses `Doconda().tools()`: ready-made tools (name, description, JSON Schema, `run`) to create, review and edit documents. The model decides when to call them and returns the links to the files.

## Docs

- Guides per stack: https://docs.doconda.com/en/agents/introduction
- Python SDK: https://docs.doconda.com/en/sdk/python · TypeScript SDK: https://docs.doconda.com/en/sdk/introduction
- MCP server: https://docs.doconda.com/en/agents/mcp

MIT licensed.
