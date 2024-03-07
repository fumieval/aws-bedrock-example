import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';
import fs from "fs";

const client = new AnthropicBedrock({ awsRegion: 'us-east-1' });

const response = await client.messages.create({
  model: "anthropic.claude-3-sonnet-20240229-v1:0",
  max_tokens: 8000,
  messages: [{role: "user", content: fs.readFileSync(process.stdin.fd, "utf-8")}],
});

console.log(response.content[0].text);
