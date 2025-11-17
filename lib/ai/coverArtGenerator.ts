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
 * Determine art style based on content themes and genre
 */
function determineArtStyle(tags: string[], context: string): string {
  const tagsLower = tags.join(' ').toLowerCase();
  const contentLower = context.toLowerCase();
  
  // Hip-hop / Rap
  if (tagsLower.match(/rap|hip-hop|urban|street|beats/)) {
    return `Bold urban hip-hop aesthetic with graffiti art, street culture vibes, and raw energy. Think golden age hip-hop album covers meets modern street art. Gritty, authentic, powerful.`;
  }
  
  // Rock / Punk / Metal
  if (tagsLower.match(/rock|punk|metal|guitar|grunge/)) {
    return `Raw punk rock aesthetic with DIY zine vibes, distressed textures, and rebellious energy. Think 80s/90s underground album covers. Edgy, loud, unapologetic.`;
  }
  
  // Electronic / Dance / Techno
  if (tagsLower.match(/electronic|techno|house|dance|edm|synth/)) {
    return `Futuristic electronic music aesthetic with geometric shapes, neon colors, and abstract patterns. Think rave culture meets digital art. Vibrant, hypnotic, modern.`;
  }
  
  // Jazz / Blues / Soul
  if (tagsLower.match(/jazz|blues|soul|funk|r&b/)) {
    return `Smooth vintage aesthetic with art deco influences, warm colors, and sophisticated vibes. Think Blue Note Records meets modern design. Classy, moody, timeless.`;
  }
  
  // Folk / Acoustic / Indie
  if (tagsLower.match(/folk|acoustic|indie|singer-songwriter/)) {
    return `Indie folk aesthetic with hand-drawn elements, earthy tones, and organic textures. Think independent label album art. Intimate, artistic, authentic.`;
  }
  
  // Comedy / Spoken Word / Podcast
  if (tagsLower.match(/comedy|funny|humor|podcast|spoken/)) {
    return `Bold comedy aesthetic with satirical illustrations, pop art influences, and playful design. Think Adult Swim meets underground comedy. Witty, irreverent, eye-catching.`;
  }
  
  // Default: Dynamic based on mood from content
  if (contentLower.match(/dark|serious|heavy|struggle/)) {
    return `Dark, dramatic aesthetic with moody lighting, bold contrasts, and intense imagery. Cinematic and powerful.`;
  } else if (contentLower.match(/happy|upbeat|fun|party/)) {
    return `Vibrant, energetic aesthetic with bold colors, dynamic composition, and playful elements. Fun and eye-catching.`;
  } else {
    // Fallback: Edgy modern style (not always cyberpunk)
    return `Contemporary edgy aesthetic with bold visual storytelling, striking composition, and artistic flair. Modern, memorable, and genre-appropriate.`;
  }
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
  
  // Determine style based on content instead of hardcoding
  const dynamicStyle = determineArtStyle(themes, context);
  
  let prompt = '';
  
  if (type === 'audio') {
    // Generate album/track cover art with dynamic style
    prompt = `
      Create album cover art for a track titled "${title}".
      
      ${context ? `Context: ${context}` : ''}
      ${themes.length > 0 ? `Themes: ${themes.join(', ')}` : ''}
      
      Art Style: ${dynamicStyle}
      
      Requirements:
      - Visually striking and memorable
      - Genre-appropriate and authentic to the music
      - Professional album cover quality
      - Artistic and creative
      - No text on the image except subtle title integration if it fits naturally
      
      Make it stand out and capture the essence of the music.
    `.trim();
  } else {
    // Generate document cover art
    const docType = aiAnalysis?.documentType || 'document';
    
    prompt = `
      Create cover art for a ${docType} titled "${title}".
      
      ${context ? `Context: ${context}` : ''}
      ${themes.length > 0 ? `Themes: ${themes.join(', ')}` : ''}
      
      Art Style: ${dynamicStyle}
      
      Requirements:
      - Professional and polished design
      - Appropriate to the document's content and tone
      - Creative and eye-catching
      - No text on the image except subtle title integration if it fits naturally
      
      Make it visually compelling and relevant to the content.
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
