# Doconda examples

[![CI](https://github.com/B-C-Software/doconda-examples/actions/workflows/ci.yml/badge.svg)](https://github.com/B-C-Software/doconda-examples/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Make your AI agent or chatbot **deliver Word (DOCX), PowerPoint (PPTX), Excel (XLSX) and PDF files**: editable, with real styles, reviewed before delivery. No python-docx, python-pptx, openpyxl or templates to maintain.

[Doconda](https://doconda.com) is a document API for AI agents. These examples show it on the most common stacks.

## Get started

1. Get an API key at [doconda.com](https://doconda.com) (new accounts get free credit) and export it:
   ```bash
   export DOCONDA_API_KEY=ak_eu_…
   ```
2. Clone the repo:
   ```bash
   git clone https://github.com/B-C-Software/doconda-examples.git
   cd doconda-examples
   ```
3. Run an example:
   ```bash
   uv run python/direct_create.py                   # Python: uv installs each script's dependencies
   cd typescript && npm install && npm run ai-sdk   # TypeScript agents
   ```
   Each file's header says which other keys it needs, for example `ANTHROPIC_API_KEY`.

## Examples

| Stack | Example | What it does |
| - | - | - |
| No agent | [`python/direct_create.py`](python/direct_create.py) | Word from a prompt, Word from Markdown, an Excel budget, review an existing file |
| No agent | [`typescript/report-from-json/`](typescript/report-from-json) | JSON findings to a branded, editable Word report and PDF, with status and style checks |
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
| Remote MCP | [`python/openai_remote_mcp.py`](python/openai_remote_mcp.py) | OpenAI Responses API with Doconda's remote MCP server, no SDK |
| MCP clients | [`mcp/`](mcp) | Add Doconda as an MCP server to Claude Code, Claude Desktop, Cursor and Codex |

Every agent example except the remote MCP one uses `Doconda().tools()`: ready-made tools (name, description, JSON Schema, `run`) to create, review and edit documents. The model decides when to call them and returns the links to the files. `openai_remote_mcp.py` points the model at Doconda's MCP server instead.

## Requirements

| Examples | Needs |
| - | - |
| `python/` | Python 3.10+ and [uv](https://docs.astral.sh/uv/). Each script declares its dependencies inline ([PEP 723](https://peps.python.org/pep-0723/)), and its header also shows the `pip install` line if you prefer pip |
| `typescript/*.ts` | Node.js 22.13+ (`npm install` in `typescript/`) |
| `typescript/report-from-json/` | Node.js 20.12+, its own `package.json` and [README](typescript/report-from-json) |

## Step-by-step tutorials

- [Excel from an Amazon Bedrock agent](https://docs.doconda.com/en/tutorials/bedrock-excel)
- [A Vercel AI SDK chatbot that returns a Word file](https://docs.doconda.com/en/tutorials/ai-sdk-chatbot-word)
- [PowerPoint from Gemini on Vertex AI](https://docs.doconda.com/en/tutorials/vertex-powerpoint)
- [Review and fix a Word file before sending it](https://docs.doconda.com/en/tutorials/review-word)

## Docs

- [Guides per stack](https://docs.doconda.com/en/agents/introduction)
- [Python SDK](https://docs.doconda.com/en/sdk/python) · [TypeScript SDK](https://docs.doconda.com/en/sdk/introduction)
- [MCP server](https://docs.doconda.com/en/agents/mcp)
- [Agent skill for Claude Code, Cursor and Codex](https://github.com/B-C-Software/doconda-skills)

## Contributing

Something doesn't work or is out of date? [Open an issue](https://github.com/B-C-Software/doconda-examples/issues) or a pull request. CI type-checks the TypeScript, lints and formats the Python (ruff) and the TypeScript (Prettier), and checks that every Python script's dependencies resolve. It never calls the Doconda API.

## License

[MIT](LICENSE)
