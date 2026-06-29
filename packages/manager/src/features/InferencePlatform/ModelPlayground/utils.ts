/** Splits a completed assistant response into the reasoning block and the visible content. */
export const parseThinking = (
  raw: string
): { content: string; thinking?: string } => {
  // Complete <think>...</think> block.
  const complete = raw.match(/<think>([\s\S]*?)<\/think>/);
  if (complete) {
    const thinking = complete[1].trim() || undefined;
    const content = raw.replace(/<think>[\s\S]*?<\/think>/, '').trim();
    return { content, thinking };
  }
  // Incomplete <think> block — stream was aborted or cut off mid-think.
  const open = raw.match(/^<think>([\s\S]*)/);
  if (open) {
    return { content: '', thinking: open[1].trim() || undefined };
  }
  return { content: raw };
};

/** Handles in-progress <think> blocks during streaming. */
export const parseThinkingLive = (
  raw: string
): { content: string; thinking?: string } => {
  const complete = raw.match(/<think>([\s\S]*?)<\/think>([\s\S]*)/);
  if (complete) {
    return {
      content: complete[2].trim(),
      thinking: complete[1].trim() || undefined,
    };
  }
  const open = raw.match(/^<think>([\s\S]*)/);
  if (open) {
    return { content: '', thinking: open[1] || undefined };
  }
  return { content: raw };
};
