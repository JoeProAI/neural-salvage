/**
 * AI Cover Art Generator
 * Generates edgy, funny, adult-humor cover art for audio tracks and documents
 */

import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CoverArtParams {
  title: string;
  type: 'audio' | 'document';
  aiAnalysis?: {
    caption?: string;
    summary?: string;
    tags?: string[];
    transcript?: string;
    documentType?: string;
  };
}

/**
 * Generate edgy, funny cover art prompt based on content
 */
function generateCoverArtPrompt(params: CoverArtParams): string {
  const { title, type, aiAnalysis } = params;
  
  // Extract key themes from AI analysis
  const themes: string[] = [];
  if (aiAnalysis?.tags) {
    themes.push(...aiAnalysis.tags.slice(0, 5));
  }
  
  const caption = aiAnalysis?.caption || aiAnalysis?.summary || '';
  const transcript = aiAnalysis?.transcript?.substring(0, 200) || '';
  
  // Build context
  const context = [caption, transcript].filter(Boolean).join(' ');
  
  // Base style for all covers - edgy, funny, adult humor
  const baseStyle = `
    Cyberpunk art style with dark humor and edgy aesthetics.
    Bold colors (neon cyan, electric purple, hot pink, acid green).
    Retro-futuristic vibe with glitch effects and VHS aesthetics.
    Slightly absurd, provocative, and fun.
    Think Adult Swim meets cyberpunk meets underground album art.
  `.trim();
  
  let prompt = '';
  
  if (type === 'audio') {
    // Generate edgy album/track cover art
    prompt = `
      Create an edgy, funny, adult-humor album cover for a track titled "${title}".
      
      ${context ? `Context: ${context}` : ''}
      ${themes.length > 0 ? `Themes: ${themes.join(', ')}` : ''}
      
      Style: ${baseStyle}
      
      Visual elements:
      - Surreal, absurdist imagery
      - Dark comedy and social commentary
      - Underground hip-hop / punk / electronic aesthetic  
      - Vintage technology meets futuristic chaos
      - Provocative but artistic
      - Graffiti-inspired typography
      
      No text on the image except stylized title integration.
      Make it memorable, controversial, and badass.
    `.trim();
  } else {
    // Generate edgy document cover art
    const docType = aiAnalysis?.documentType || 'document';
    
    prompt = `
      Create an edgy, funny, satirical cover art for a ${docType} titled "${title}".
      
      ${context ? `Context: ${context}` : ''}
      ${themes.length > 0 ? `Themes: ${themes.join(', ')}` : ''}
      
      Style: ${baseStyle}
      
      Visual elements:
      - Satirical take on corporate/academic aesthetics
      - Dystopian bureaucracy meets cyberpunk
      - Absurdist office humor or academic parody
      - Vintage technical manuals meets glitch art
      - Tongue-in-cheek, subversive, clever
      
      No text on the image except stylized title integration.
      Make it ironic, witty, and visually striking.
    `.trim();
  }
  
  return prompt;
}

/**
 * Generate cover art using DALL-E
 */
export async function generateCoverArt(params: CoverArtParams): Promise<{
  imageUrl: string;
  prompt: string;
}> {
  try {
    const prompt = generateCoverArtPrompt(params);
    
    console.log('🎨 [COVER ART] Generating with DALL-E...');
    console.log('📝 [COVER ART] Prompt:', prompt);
    
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid', // More dramatic, edgy style
    });
    
    const imageUrl = response.data?.[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }
    
    console.log('✅ [COVER ART] Generated successfully');
    
    return {
      imageUrl,
      prompt,
    };
  } catch (error: any) {
    console.error('❌ [COVER ART] Generation failed:', error);
    throw new Error(`Failed to generate cover art: ${error.message}`);
  }
}

/**
 * Download image from URL and return as buffer
 */
export async function downloadImage(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate funny, adult-humor fallback prompts if AI analysis is missing
 */
export function getFallbackPrompts(title: string, type: 'audio' | 'document'): string[] {
  const baseStyles = [
    'Cyberpunk dystopia with neon aesthetics',
    'Retro VHS glitch art with surreal elements',
    'Underground graffiti meets futuristic tech',
    'Vintage sci-fi paperback meets modern chaos',
    'Dark comedy anime style with urban grit',
  ];
  
  const randomStyle = baseStyles[Math.floor(Math.random() * baseStyles.length)];
  
  if (type === 'audio') {
    return [
      `Edgy album cover for "${title}". ${randomStyle}. Bold, provocative, and badass.`,
      `Underground music cover art for "${title}". Adult humor, cyberpunk aesthetic, absurdist imagery.`,
      `Controversial album art for "${title}". Neon colors, glitch effects, dark comedy vibes.`,
    ];
  } else {
    return [
      `Satirical document cover for "${title}". ${randomStyle}. Ironic, witty, subversive.`,
      `Dystopian manual cover for "${title}". Corporate satire meets cyberpunk, darkly funny.`,
      `Absurdist cover art for "${title}". Bureaucracy parody with glitch aesthetics.`,
    ];
  }
}
