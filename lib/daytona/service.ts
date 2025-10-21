import { Daytona } from '@daytonaio/sdk';

interface DaytonaConfig {
  apiKey: string;
  apiUrl?: string;
  target?: 'us' | 'eu';
}

interface AIAnalysisResult {
  caption?: string;
  tags?: string[];
  nsfw?: boolean;
  nsfwScore?: number;
  ocr?: string;
  colors?: string[];
  transcript?: string;
}

export class DaytonaService {
  private daytona: Daytona;
  private config: DaytonaConfig;

  constructor(config?: Partial<DaytonaConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.DAYTONA_API_KEY || '',
      apiUrl: config?.apiUrl || process.env.DAYTONA_API_URL,
      target: (config?.target as 'us' | 'eu') || 'us',
    };

    if (!this.config.apiKey) {
      throw new Error('DAYTONA_API_KEY is required');
    }

    this.daytona = new Daytona({
      apiKey: this.config.apiKey,
      apiUrl: this.config.apiUrl,
      target: this.config.target,
    });
  }

  /**
   * Analyze image with AI in Daytona sandbox
   */
  async analyzeImage(imageUrl: string): Promise<AIAnalysisResult> {
    const sandbox = await this.daytona.create({
      envVars: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
        IMAGE_URL: imageUrl,
      },
    });

    try {
      // Python code for comprehensive image analysis
      const analysisCode = `
import os
import json
import base64
import requests
from openai import OpenAI

client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
image_url = os.environ['IMAGE_URL']

# Initialize results
results = {
    "caption": "",
    "tags": [],
    "nsfw": False,
    "nsfwScore": 0.0,
    "ocr": "",
    "colors": []
}

try:
    # 1. Generate Caption
    caption_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Describe this image in detail. Focus on the main subjects, composition, colors, mood, and any notable elements. Keep it concise but informative."
                },
                {
                    "type": "image_url",
                    "image_url": {"url": image_url}
                }
            ]
        }],
        max_tokens=300
    )
    results["caption"] = caption_response.choices[0].message.content

    # 2. Generate Tags
    tags_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": f"Based on this image and its caption: '{results['caption']}', generate 10-15 relevant tags. Return only the tags as a comma-separated list."
                },
                {
                    "type": "image_url",
                    "image_url": {"url": image_url}
                }
            ]
        }],
        max_tokens=150
    )
    tags_text = tags_response.choices[0].message.content
    results["tags"] = [tag.strip().lower() for tag in tags_text.split(",") if tag.strip()]

    # 3. NSFW Detection
    nsfw_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Analyze this image for NSFW content. Respond with only a JSON object: {\\"nsfw\\": true/false, \\"score\\": 0-1}"
                },
                {
                    "type": "image_url",
                    "image_url": {"url": image_url}
                }
            ]
        }],
        max_tokens=50
    )
    nsfw_data = json.loads(nsfw_response.choices[0].message.content)
    results["nsfw"] = nsfw_data.get("nsfw", False)
    results["nsfwScore"] = nsfw_data.get("score", 0.0)

    # 4. OCR Text Extraction
    ocr_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Extract all visible text from this image. Return only the extracted text, preserving formatting where possible."
                },
                {
                    "type": "image_url",
                    "image_url": {"url": image_url}
                }
            ]
        }],
        max_tokens=500
    )
    results["ocr"] = ocr_response.choices[0].message.content

    # 5. Color Analysis
    colors_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Identify the 5 dominant colors in this image. Return them as hex color codes in a comma-separated list (e.g., #FF5733, #33FF57)."
                },
                {
                    "type": "image_url",
                    "image_url": {"url": image_url}
                }
            ]
        }],
        max_tokens=100
    )
    colors_text = colors_response.choices[0].message.content
    results["colors"] = [color.strip() for color in colors_text.split(",") if color.strip().startswith("#")]

except Exception as e:
    results["error"] = str(e)

print(json.dumps(results))
`;

      const response = await sandbox.process.codeRun(analysisCode);

      if (response.exitCode !== 0) {
        throw new Error(`Analysis failed: ${response.result}`);
      }

      const result: AIAnalysisResult = JSON.parse(response.result);
      return result;
    } finally {
      // Clean up sandbox
      await sandbox.delete();
    }
  }

  /**
   * Analyze video (extract keyframes and analyze)
   */
  async analyzeVideo(videoUrl: string): Promise<AIAnalysisResult> {
    const sandbox = await this.daytona.create({
      envVars: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
        VIDEO_URL: videoUrl,
      },
    });

    try {
      const analysisCode = `
import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
video_url = os.environ['VIDEO_URL']

results = {
    "tags": [],
    "caption": "Video analysis"
}

try:
    # For video, analyze the thumbnail/poster
    tags_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Generate 10-15 relevant tags for this video. Return only the tags as a comma-separated list."
                },
                {
                    "type": "image_url",
                    "image_url": {"url": video_url}
                }
            ]
        }],
        max_tokens=150
    )
    tags_text = tags_response.choices[0].message.content
    results["tags"] = [tag.strip().lower() for tag in tags_text.split(",") if tag.strip()]
except Exception as e:
    results["error"] = str(e)

print(json.dumps(results))
`;

      const response = await sandbox.process.codeRun(analysisCode);

      if (response.exitCode !== 0) {
        throw new Error(`Video analysis failed: ${response.result}`);
      }

      return JSON.parse(response.result);
    } finally {
      await sandbox.delete();
    }
  }

  /**
   * Transcribe audio with Whisper
   */
  async transcribeAudio(audioUrl: string): Promise<AIAnalysisResult> {
    const sandbox = await this.daytona.create({
      envVars: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
        AUDIO_URL: audioUrl,
      },
    });

    try {
      const transcriptionCode = `
import os
import json
import requests
from openai import OpenAI

client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
audio_url = os.environ['AUDIO_URL']

results = {
    "transcript": "",
    "tags": []
}

try:
    # Download audio file
    audio_response = requests.get(audio_url)
    with open("/tmp/audio.mp3", "wb") as f:
        f.write(audio_response.content)
    
    # Transcribe with Whisper
    with open("/tmp/audio.mp3", "rb") as audio_file:
        transcript_response = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
        results["transcript"] = transcript_response.text
    
    # Generate tags from transcript
    if results["transcript"]:
        tags_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": f"Based on this audio transcript: '{results['transcript']}', generate 10-15 relevant tags. Return only the tags as a comma-separated list."
            }],
            max_tokens=150
        )
        tags_text = tags_response.choices[0].message.content
        results["tags"] = [tag.strip().lower() for tag in tags_text.split(",") if tag.strip()]

except Exception as e:
    results["error"] = str(e)

print(json.dumps(results))
`;

      const response = await sandbox.process.codeRun(transcriptionCode);

      if (response.exitCode !== 0) {
        throw new Error(`Transcription failed: ${response.result}`);
      }

      return JSON.parse(response.result);
    } finally {
      await sandbox.delete();
    }
  }

  /**
   * Generate text embedding for semantic search
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const sandbox = await this.daytona.create({
      envVars: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
        TEXT_INPUT: text,
      },
    });

    try {
      const embeddingCode = `
import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
text = os.environ['TEXT_INPUT']

try:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    embedding = response.data[0].embedding
    print(json.dumps({"embedding": embedding}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

      const response = await sandbox.process.codeRun(embeddingCode);

      if (response.exitCode !== 0) {
        throw new Error(`Embedding generation failed: ${response.result}`);
      }

      const result = JSON.parse(response.result);
      return result.embedding;
    } finally {
      await sandbox.delete();
    }
  }

  /**
   * Process multiple images in parallel using multiple sandboxes
   */
  async analyzeImagesBatch(imageUrls: string[]): Promise<AIAnalysisResult[]> {
    const promises = imageUrls.map((url) => this.analyzeImage(url));
    return Promise.all(promises);
  }
}

// Export singleton instance
export const daytonaService = new DaytonaService();
