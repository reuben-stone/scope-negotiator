import Anthropic from "@anthropic-ai/sdk";
import { z, toJSONSchema } from "zod";

const client = new Anthropic();

type ModelCallParams = {
  system: string;
  user: string;
  toolName: string;
  schema: z.ZodType;
};

/**
 * Call the model with a forced tool use to get structured output.
 * Returns the parsed + validated result, or throws with a diagnostic message.
 */
export async function callModel<T>(
  params: ModelCallParams & { schema: z.ZodType<T> }
): Promise<T> {
  const jsonSchema = toJSONSchema(params.schema);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: params.system,
    tools: [
      {
        name: params.toolName,
        description: `Return the structured ${params.toolName} result.`,
        input_schema: jsonSchema as Anthropic.Messages.Tool.InputSchema,
      },
    ],
    tool_choice: { type: "tool", name: params.toolName },
    messages: [{ role: "user", content: params.user }],
  });

  const toolBlock = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock =>
      block.type === "tool_use"
  );

  if (!toolBlock) {
    throw new Error("Model did not return a tool use block");
  }

  const parsed = params.schema.safeParse(toolBlock.input);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Model returned invalid structure: ${issues}`);
  }

  return parsed.data;
}
