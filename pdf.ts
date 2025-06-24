import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import fs from "fs";

const client = new AnthropicBedrock({ awsRegion: "us-east-1" });

const rawPDF = fs.readFileSync(process.argv[2]);

const response = await client.messages.create({
  model: "us.anthropic.claude-sonnet-4-20250514-v1:0",
  max_tokens: 8000,
  temperature: 0,
  messages: [
    {
      role: "user",
      content: [
        {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: rawPDF.toString("base64"),
          },
        },
        { type: "text", text: "Convert this PDF to Markdown" },
      ],
    },
  ],
});

console.log(response.usage);

for (const message of response.content) {
  if (message.type === "text") {
    console.log(message.text);
  }
}
