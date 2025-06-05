export function isImagePrompt(prompt: string): boolean {
  const imageKeywords = [
    'draw', 'picture', 'image', 'photo', 'visualize', 'generate an image',
    'create an image', 'make an image', 'show me', 'generate a picture',
    'create a picture', 'make a picture', 'generate a photo', 'create a photo',
    'make a photo', 'generate a drawing', 'create a drawing', 'make a drawing'
  ];
  
  return imageKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword.toLowerCase())
  );
} 