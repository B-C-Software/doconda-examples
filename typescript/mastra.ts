// Mastra agent with Doconda's tools.
// npm install @mastra/core @doconda/sdk
// export DOCONDA_API_KEY=ak_eu_…  (https://doconda.com)

import { Agent } from "@mastra/core/agent"
import { createTool } from "@mastra/core/tools"
import { Doconda } from "@doconda/sdk"

const doconda = new Doconda()
const tools = Object.fromEntries(
  doconda.tools().map((t) => [
    t.name,
    createTool({ id: t.name, description: t.description, inputSchema: t.inputSchema, execute: (input) => t.run(input as Record<string, unknown>) }),
  ]),
)

const agent = new Agent({
  id: "documents",
  name: "Documents",
  instructions: "You create, review and edit documents with Doconda.",
  model: "anthropic/claude-sonnet-5-5", // or any other provider
  tools,
})

const { text } = await agent.generate("Create a 5-slide presentation on our quarterly results")
