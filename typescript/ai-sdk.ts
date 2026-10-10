// Vercel AI SDK agent with Doconda's tools (any model).
// Run from typescript/: npm install && npm run ai-sdk
// Needs DOCONDA_API_KEY (https://doconda.com) and ANTHROPIC_API_KEY, or another provider's model and key

import { anthropic } from "@ai-sdk/anthropic"
import { generateText, isStepCount, jsonSchema, tool } from "ai"
import { Doconda } from "@doconda/sdk"

const doconda = new Doconda()
const tools = Object.fromEntries(
  doconda.tools().map((t) => [
    t.name,
    tool({
      description: t.description,
      inputSchema: jsonSchema(t.inputSchema),
      execute: (input) => t.run(input as Record<string, unknown>),
    }),
  ]),
)

const { text } = await generateText({
  model: anthropic("claude-sonnet-5-5"), // or any other provider
  tools,
  stopWhen: isStepCount(5),
  prompt: "Create a 5-slide presentation on our quarterly results",
})
console.log(text)
