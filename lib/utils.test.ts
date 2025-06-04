import { isImagePrompt } from './utils';

describe('isImagePrompt', () => {
  it('matches image-related keywords (case-insensitive)', () => {
    expect(isImagePrompt('draw a cat')).toBe(true);
    expect(isImagePrompt('Can you PICTURE this?')).toBe(true);
    expect(isImagePrompt('Send me an IMAGE of a dog')).toBe(true);
    expect(isImagePrompt('Show me a photo of a sunset')).toBe(true);
    expect(isImagePrompt('Visualize a rocket')).toBe(true);
    expect(isImagePrompt('generate an image of a tree')).toBe(true);
  });

  it('does not match unrelated prompts', () => {
    expect(isImagePrompt('Tell me a joke')).toBe(false);
    expect(isImagePrompt('What is the weather?')).toBe(false);
    expect(isImagePrompt('Explain quantum physics')).toBe(false);
    expect(isImagePrompt('Write a poem')).toBe(false);
  });

  it('handles empty and null input', () => {
    expect(isImagePrompt('')).toBe(false);
    // @ts-expect-error
    expect(isImagePrompt(null)).toBe(false);
    // @ts-expect-error
    expect(isImagePrompt(undefined)).toBe(false);
  });
}); 