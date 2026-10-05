// Vercel AI SDK agent with Doconda's tools (any model).
// npm install ai @ai-sdk/anthropic @doconda/sdk
// export DOCONDA_API_KEY=ak_eu_…  (https://doconda.com)

import { anthropic } from "@ai-sdk/anthropic"
import { generateText, isStepCount, jsonSchema, tool } from "ai"
import { Doconda } from "@doconda/sdk"

const doconda = new Doconda()
const tools = Object.fromEntries(
  doconda.tools().map((t) => [
    t.name,
    tool({ description: t.description, inputSchema: jsonSchema(t.inputSchema), execute: (input) => t.run(input as Record<string, unknown>) }),
  ]),
)

const { text } = await generateText({
  model: anthropic("claude-sonnet-5-5"), // or any other provider
  tools,
  stopWhen: isStepCount(5),
  prompt: "Create a 5-slide presentation on our quarterly results",
})
