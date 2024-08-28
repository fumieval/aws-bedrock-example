import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';
import { Tool } from '@anthropic-ai/sdk/resources/messages.mjs';
import fs from "fs";
import { z } from "zod";
import zodToJsonSchema from 'zod-to-json-schema';

const client = new AnthropicBedrock({ awsRegion: 'us-east-1' });

const schema = z.object({
  title: z.string(),
  description: z.string(),
  salary_currency: z.enum(["USD", "EUR", "JPY"]),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  salary_note: z.string().optional(),
  location: z.string(),
  employment_type: z.enum(["full-time", "part-time", "contract", "temporary", "internship"]),
  benefits: z.array(z.string()),
});

function zodToInputSchema<T>(
  schema: z.ZodSchema<T>
): Tool.InputSchema {
  const jsonSchema = zodToJsonSchema(schema, "input").definitions?.input;
  if (!jsonSchema) {
    throw new Error("Failed to convert Zod schema to JSON schema");
  }
  console.log(jsonSchema);
  return jsonSchema as Tool.InputSchema;
}

const content = fs.readFileSync(process.stdin.fd, "utf-8");

const response = await client.messages.create({
  model: "anthropic.claude-3-5-sonnet-20240620-v1:0",
  max_tokens: 8000,
  tool_choice: {
    type: "tool",
    name: "json-output",
  },
  system: "Convert the given text into structured data",
  messages: [{role: "user", content}],
  tools: [
    {
      name: "json-output",
      input_schema: zodToInputSchema(schema),
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
