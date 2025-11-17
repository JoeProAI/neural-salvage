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
 * Determine art style based on content themes and genre with variety
 */
function determineArtStyle(tags: string[], context: string): string {
  const tagsLower = tags.join(' ').toLowerCase();
  const contentLower = context.toLowerCase();
  
  // Hip-hop / Rap - Multiple style variations
  if (tagsLower.match(/rap|hip-hop|urban|street|beats/)) {
    const hipHopStyles = [
      `Bold graffiti art with spray paint textures, street culture vibes, and urban energy. Raw, authentic, powerful.`,
      `90s golden age hip-hop aesthetic with retro typography, boom box culture, and nostalgic vibes. Classic and iconic.`,
      `Modern trap aesthetic with dark moody tones, luxury elements, and street sophistication. Sleek and contemporary.`,
      `Underground hip-hop style with DIY collage art, rough textures, and rebellious energy. Gritty and independent.`,
      `Abstract hip-hop art with bold geometric shapes, vibrant colors, and dynamic composition. Artistic and modern.`,
      `Photography-based street culture with urban landscapes, city life, and authentic moments. Cinematic and real.`,
    ];
    return hipHopStyles[Math.floor(Math.random() * hipHopStyles.length)];
  }
  
  // Rock / Punk / Metal - Multiple variations
  if (tagsLower.match(/rock|punk|metal|guitar|grunge/)) {
    const rockStyles = [
      `Raw punk zine aesthetic with cut-and-paste collage, distressed textures, and DIY energy. Rebellious and loud.`,
      `Psychedelic rock art with surreal imagery, flowing shapes, and vibrant colors. Trippy and artistic.`,
      `Heavy metal darkness with gothic elements, dramatic lighting, and intense imagery. Powerful and ominous.`,
      `Grunge aesthetic with gritty photography, muted tones, and raw authenticity. Moody and real.`,
      `Classic rock poster style with bold typography, vintage vibes, and iconic imagery. Timeless and cool.`,
      `Alternative rock minimalism with clean design, conceptual art, and modern edge. Sophisticated and artistic.`,
    ];
    return rockStyles[Math.floor(Math.random() * rockStyles.length)];
  }
  
  // Electronic / Dance - Multiple variations
  if (tagsLower.match(/electronic|techno|house|dance|edm|synth/)) {
    const electronicStyles = [
      `Futuristic digital art with geometric shapes, neon colors, and glitch effects. Vibrant and hypnotic.`,
      `Retro synthwave aesthetic with 80s vibes, purple/pink gradients, and nostalgic future. Cool and dreamy.`,
      `Minimal techno design with abstract patterns, monochrome palette, and clean composition. Sophisticated and modern.`,
      `Rave culture explosion with colorful chaos, psychedelic patterns, and energetic vibes. Wild and fun.`,
      `Ambient electronic art with soft gradients, organic shapes, and ethereal atmosphere. Calm and beautiful.`,
      `Cyberpunk aesthetic with neon cityscapes, dark tones, and futuristic edge. Edgy and immersive.`,
    ];
    return electronicStyles[Math.floor(Math.random() * electronicStyles.length)];
  }
  
  // Jazz / Blues / Soul - Multiple variations
  if (tagsLower.match(/jazz|blues|soul|funk|r&b/)) {
    const jazzStyles = [
      `Blue Note Records style with art deco elements, sophisticated design, and warm tones. Classic and timeless.`,
      `Vintage jazz club aesthetic with smoky atmosphere, moody lighting, and noir vibes. Classy and mysterious.`,
      `Modern R&B minimalism with clean design, bold typography, and contemporary edge. Sleek and stylish.`,
      `Funk explosion with vibrant colors, groovy patterns, and playful energy. Fun and dynamic.`,
      `Soul music warmth with retro photography, rich tones, and emotional depth. Intimate and powerful.`,
      `Abstract jazz art with improvised shapes, flowing lines, and artistic freedom. Creative and expressive.`,
    ];
    return jazzStyles[Math.floor(Math.random() * jazzStyles.length)];
  }
  
  // Folk / Acoustic / Indie - Multiple variations
  if (tagsLower.match(/folk|acoustic|indie|singer-songwriter/)) {
    const indieStyles = [
      `Hand-drawn illustration with earthy tones, organic textures, and intimate vibes. Artistic and personal.`,
      `Indie folk photography with natural landscapes, soft lighting, and authentic moments. Calm and beautiful.`,
      `Watercolor art with flowing colors, delicate details, and dreamy atmosphere. Gentle and artistic.`,
      `Vintage aesthetic with aged textures, warm tones, and nostalgic charm. Timeless and cozy.`,
      `Modern indie minimalism with clean design, conceptual imagery, and subtle sophistication. Contemporary and thoughtful.`,
      `Collage art with mixed media, layered textures, and creative composition. Unique and expressive.`,
    ];
    return indieStyles[Math.floor(Math.random() * indieStyles.length)];
  }
  
  // Default: Random artistic style
  const generalStyles = [
    `Contemporary artistic design with bold visual storytelling and striking composition. Modern and memorable.`,
    `Abstract expressionism with dynamic shapes, vibrant colors, and emotional energy. Powerful and unique.`,
    `Minimalist approach with clean lines, negative space, and sophisticated restraint. Elegant and impactful.`,
    `Surrealist imagery with dreamlike scenes, unexpected juxtapositions, and artistic vision. Imaginative and captivating.`,
    `Pop art influence with bold colors, graphic elements, and contemporary culture. Eye-catching and fun.`,
    `Atmospheric photography with dramatic lighting, rich textures, and cinematic quality. Professional and stunning.`,
  ];
  return generalStyles[Math.floor(Math.random() * generalStyles.length)];
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
