# Claude Code: Doconda's MCP server, so Claude can create, review and edit Word, PowerPoint, Excel and PDF files.
claude mcp add --transport stdio --env DOCONDA_API_KEY=ak_eu_… doconda -- npx -y @doconda/mcp

# Or the remote server (no install):
# claude mcp add --transport http doconda https://api.eu.doconda.com/mcp --header "Authorization: Bearer ak_eu_…"
