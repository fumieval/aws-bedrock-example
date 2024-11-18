import Anthropic from '@anthropic-ai/sdk';
import { Tool } from '@anthropic-ai/sdk/resources/messages.mjs';
import fs from "fs";
import { z } from "zod";
import zodToJsonSchema from 'zod-to-json-schema';

const client = new Anthropic();

const schema = z.object({
  commonName: z.string(),
  scientificName: z.string(),
  length: z.number(),
  wingspan: z.number(),
  weight: z.number(),
  class: z.string(),
  order: z.string(),
  family: z.string(),
  genus: z.string(),
  species: z.string(),
  summary: z.string().describe("A brief summary of the species"),
  feeding_habit: z.enum(["herbivore", "carnivore", "omnivore", "insectivore", "frugivore", "nectarivore", "molluscivore", "piscivore", "detritivore"]).array(),
  distribution: z.string().array(),
});

function zodToInputSchema<T>(schema: z.ZodSchema<T>): Tool.InputSchema {
  const jsonSchema = zodToJsonSchema(schema, "input").definitions?.input;
  if (!jsonSchema) {
    throw new Error("Failed to convert Zod schema to JSON schema");
  }
  return jsonSchema as Tool.InputSchema;
}

const content = fs.readFileSync(process.stdin.fd, 'utf-8');

const response = await client.messages.create({
  model: "claude-3-5-haiku-latest",
  temperature: 0,
  max_tokens: 8000,
  tool_choice: {
    type: "tool",
    name: "json-output",
  },
  system: "Convert the given text into structured data using json-output tool",
  messages: [{role: "user", content}],
  tools: [
    {
      name: "json-output",
      input_schema: zodToInputSchema(schema),
      description: "Export structured data as JSON",
    }
  ],
});

for (const block of response.content) {
  if (block.type === "tool_use"){
    console.log(block.input);
  } else {
    console.log(block.text);
  }
}
