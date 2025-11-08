import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { adminDb, adminStorage } from '@/lib/firebase/admin';
import fetch from 'node-fetch';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { collectionName, description, userId } = await request.json();

    if (!collectionName || !userId) {
      return NextResponse.json(
        { error: 'Collection name and user ID are required' },
        { status: 400 }
      );
    }

    console.log('🎨 [COLLECTION ICON] Generating icon for:', collectionName);

    // Generate AI icon prompt based on collection name and description
    const prompt = generateIconPrompt(collectionName, description);

    // Generate icon with DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }

    console.log('✅ [COLLECTION ICON] Image generated');

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image');
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Upload to Firebase Storage
    const bucket = adminStorage().bucket();
    const timestamp = Date.now();
    const fileName = `${userId}/collections/${timestamp}_${collectionName.replace(/[^a-z0-9]/gi, '_')}.jpg`;
    const file = bucket.file(fileName);

    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          collectionName,
          prompt,
          generatedAt: new Date().toISOString(),
        },
      },
    });

    // Make file publicly accessible
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    console.log('✅ [COLLECTION ICON] Uploaded to Firebase:', publicUrl);

    return NextResponse.json({
      success: true,
      iconUrl: publicUrl,
      prompt,
    });
  } catch (error: any) {
    console.error('❌ [COLLECTION ICON] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate collection icon' },
      { status: 500 }
    );
  }
}

function generateIconPrompt(collectionName: string, description?: string): string {
  // Create a cyberpunk/edgy prompt for collection icons
  const baseStyle = 'Digital art icon, cyberpunk aesthetic, neon colors, futuristic, edgy, clean composition, centered design, dark background with bright accent colors';

  // Keywords based on common collection themes
  const themeMap: Record<string, string> = {
    'music|audio|sound|track|song': 'music visualizer waves, sound frequencies, neon audio waveforms, cyberpunk music equipment',
    'photo|image|picture': 'camera lens, photography equipment, neon frames, digital gallery',
    'video|film|movie': 'film reel, play button, video camera, cinematic elements',
    'document|pdf|text|file': 'digital files, glowing documents, data streams, futuristic filing system',
    'art|design|creative': 'digital canvas, paint splashes, creative tools, artistic elements',
    'work|project|business': 'digital workspace, neon grid, professional tech elements',
    'personal|private|memories': 'locked vault, secure data, encrypted files, privacy shields',
    'favorite|best|top': 'star burst, crown, trophy, premium badge',
    'game|gaming': 'game controller, pixel art, arcade elements, gaming icons',
    'travel|adventure': 'compass, map, location pins, journey elements',
  };

  // Find matching theme
  let themeElements = 'abstract geometric patterns, neon grid, digital elements';
  const combinedText = `${collectionName} ${description || ''}`.toLowerCase();

  for (const [keywords, elements] of Object.entries(themeMap)) {
    const regex = new RegExp(keywords, 'i');
    if (regex.test(combinedText)) {
      themeElements = elements;
      break;
    }
  }

  // Build the prompt
  const prompt = `${baseStyle}. Theme: ${themeElements}. Style: Bold and eye-catching, perfect for a folder icon. Title concept: "${collectionName}". Dark cyberpunk background with vibrant neon accents (cyan, purple, pink, orange). Modern, sleek, professional but edgy.`;

  return prompt;
}
