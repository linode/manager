import { parseThinking, parseThinkingLive } from './utils';

const THE_ANSWER = 'The answer.';

describe('parseThinking', () => {
  it('returns content as-is when no <think> tag is present', () => {
    expect(parseThinking('Hello, world!')).toEqual({
      content: 'Hello, world!',
    });
  });

  it('extracts thinking and content from a complete <think> block', () => {
    const raw = '<think>My reasoning here</think>The answer is 42.';
    expect(parseThinking(raw)).toEqual({
      content: 'The answer is 42.',
      thinking: 'My reasoning here',
    });
  });

  it('trims whitespace from both thinking and content', () => {
    const raw = '<think>  reasoning  </think>  answer  ';
    expect(parseThinking(raw)).toEqual({
      content: 'answer',
      thinking: 'reasoning',
    });
  });

  it('returns no thinking property when think block is empty', () => {
    const raw = `<think></think>${THE_ANSWER}`;
    expect(parseThinking(raw)).toEqual({ content: THE_ANSWER });
  });

  it('returns no thinking property when think block contains only whitespace', () => {
    const raw = `<think>   </think>${THE_ANSWER}`;
    expect(parseThinking(raw)).toEqual({ content: THE_ANSWER });
  });

  it('returns content: "" and thinking when block is incomplete (stream cut off mid-think)', () => {
    const raw = '<think>still reasoning...';
    expect(parseThinking(raw)).toEqual({
      content: '',
      thinking: 'still reasoning...',
    });
  });

  it('returns no thinking property for an incomplete but empty think block', () => {
    expect(parseThinking('<think>')).toEqual({ content: '' });
  });

  it('handles multiline thinking content', () => {
    const raw = '<think>line one\nline two\nline three</think>Final answer.';
    expect(parseThinking(raw)).toEqual({
      content: 'Final answer.',
      thinking: 'line one\nline two\nline three',
    });
  });

  it('strips the think block and preserves content after it', () => {
    const raw = '<think>reasoning</think>answer';
    expect(parseThinking(raw)).toEqual({
      content: 'answer',
      thinking: 'reasoning',
    });
  });
});

describe('parseThinkingLive', () => {
  it('returns the raw string as content when no <think> tag is present', () => {
    expect(parseThinkingLive('Hello!')).toEqual({ content: 'Hello!' });
  });

  it('extracts thinking and content after </think> when block is complete', () => {
    const raw = '<think>My reasoning</think> The answer.';
    expect(parseThinkingLive(raw)).toEqual({
      content: 'The answer.',
      thinking: 'My reasoning',
    });
  });

  it('trims whitespace from thinking and content when block is complete', () => {
    const raw = '<think>  reasoning  </think>  answer  ';
    expect(parseThinkingLive(raw)).toEqual({
      content: 'answer',
      thinking: 'reasoning',
    });
  });

  it('returns no thinking property when complete think block is empty', () => {
    const raw = `<think></think>${THE_ANSWER}`;
    expect(parseThinkingLive(raw)).toEqual({ content: THE_ANSWER });
  });

  it('returns content: "" and thinking text when inside an open <think> block', () => {
    const raw = '<think>still thinking...';
    expect(parseThinkingLive(raw)).toEqual({
      content: '',
      thinking: 'still thinking...',
    });
  });

  it('preserves trailing whitespace in partial thinking text (live streaming)', () => {
    // parseThinkingLive does NOT trim the open block so the UI does not
    // jump as more tokens arrive mid-stream.
    const raw = '<think>reasoning so far ';
    expect(parseThinkingLive(raw)).toEqual({
      content: '',
      thinking: 'reasoning so far ',
    });
  });

  it('returns no thinking property for an open but empty think tag', () => {
    expect(parseThinkingLive('<think>')).toEqual({ content: '' });
  });

  it('handles multiline thinking during streaming', () => {
    const raw = '<think>line one\nline two\n';
    expect(parseThinkingLive(raw)).toEqual({
      content: '',
      thinking: 'line one\nline two\n',
    });
  });

  it('returns empty content when thinking block is complete but no following content yet', () => {
    const raw = '<think>reasoning</think>';
    expect(parseThinkingLive(raw)).toEqual({
      content: '',
      thinking: 'reasoning',
    });
  });
});
