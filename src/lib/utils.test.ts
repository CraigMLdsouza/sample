import { isImagePrompt } from './utils';

describe('isImagePrompt', () => {
  it('matches image-related keywords (case-insensitive)', () => {
    expect(isImagePrompt('draw a cat')).toBe(true);
    expect(isImagePrompt('Can you PICTURE this?')).toBe(true);
    expect(isImagePrompt('Send me an IMAGE of a dog')).toBe(true);
    expect(isImagePrompt('Show me a photo of a sunset')).toBe(true);
    expect(isImagePrompt('Visualize a rocket')).toBe(true);
    expect(isImagePrompt('generate an image of a tree')).toBe(true);
    expect(isImagePrompt('create an image of a mountain')).toBe(true);
    expect(isImagePrompt('make a picture of a beach')).toBe(true);
    expect(isImagePrompt('generate a photo of a city')).toBe(true);
    expect(isImagePrompt('create a drawing of a flower')).toBe(true);
    expect(isImagePrompt('make a photo of a sunset')).toBe(true);
  });

  it('does not match unrelated prompts', () => {
    expect(isImagePrompt('Tell me a joke')).toBe(false);
    expect(isImagePrompt('What is the weather?')).toBe(false);
    expect(isImagePrompt('Explain quantum physics')).toBe(false);
    expect(isImagePrompt('Write a poem')).toBe(false);
    expect(isImagePrompt('Describe a scene')).toBe(false);
    expect(isImagePrompt('Tell me about')).toBe(false);
  });

  it('handles empty and null input', () => {
    expect(isImagePrompt('')).toBe(false);
    // @ts-expect-error "null" is not a valid string
    expect(isImagePrompt(null)).toBe(false);
    // @ts-expect-error "undefined" is not a valid string
    expect(isImagePrompt(undefined)).toBe(false);
  });
}); 