export function isImagePrompt(prompt: string): boolean {
  return /(draw|picture|image|photo|visualize|generate an image)/i.test(prompt);
} 