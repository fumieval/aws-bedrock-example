import { BedrockRuntime } from "@aws-sdk/client-bedrock-runtime";
import fs from "fs";

const bedrockRuntime = new BedrockRuntime();

const prompt = `Human: ${fs.readFileSync(process.stdin.fd, "utf-8")}
Assistant:`;

const request = {
  modelId: "anthropic.claude-v2:1",
  contentType: "application/json",
  accept: "*/*",
  body: JSON.stringify({
    prompt: prompt,
    max_tokens_to_sample: 4000,
    stop_sequences: ["Human:"],
    anthropic_version: "bedrock-2023-05-31",
  }),
};

const response = await bedrockRuntime.invokeModel(request);
const body = JSON.parse(Buffer.from(response.body).toString("utf-8"));
console.log(body.completion);
