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
  summary?: string;
  keyTopics?: string[];
  documentType?: string;
  extractedText?: string;
  error?: string;
  analyzedAt?: Date;
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
    const sandbox = await this.daytona.create(
      {
        envVars: {
          OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
          IMAGE_URL: imageUrl,
        },
      },
      { timeout: 0 } // Disable timeout - let analysis complete
    );

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
    nsfw_content = nsfw_response.choices[0].message.content
    try:
        nsfw_data = json.loads(nsfw_content)
        results["nsfw"] = nsfw_data.get("nsfw", False)
        results["nsfwScore"] = nsfw_data.get("score", 0.0)
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        results["nsfw"] = False
        results["nsfwScore"] = 0.0

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

      // Parse JSON with error handling
      let result: AIAnalysisResult;
      try {
        result = JSON.parse(response.result);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', response.result);
        throw new Error(`AI generation failed: Invalid JSON response. Raw output: ${response.result?.substring(0, 200)}`);
      }
      
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
    const sandbox = await this.daytona.create(
      {
        envVars: {
          OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
          VIDEO_URL: videoUrl,
        },
      },
      { timeout: 0 }
    );

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

      try {
        return JSON.parse(response.result);
      } catch (parseError) {
        console.error('Failed to parse video analysis JSON:', response.result);
        throw new Error(`Video analysis failed: Invalid JSON response`);
      }
    } finally {
      await sandbox.delete();
    }
  }

  /**
   * Transcribe audio with Whisper
   */
  async transcribeAudio(audioUrl: string): Promise<AIAnalysisResult> {
    console.log('🎵 [DAYTONA] Starting audio transcription:', {
      url: audioUrl.substring(0, 100),
      hasDeepgramKey: !!process.env.DEEPGRAM_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    });

    const sandbox = await this.daytona.create(
      {
        envVars: {
          DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY || '',
          OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
          AUDIO_URL: audioUrl,
        },
      },
      { timeout: 0 }
    );

    console.log('🎵 [DAYTONA] Sandbox created successfully');

    try {
      const transcriptionCode = `
import os
import json
import sys
import requests
from openai import OpenAI

# Log to stderr for debugging
def log(msg):
    print(f"[AUDIO] {msg}", file=sys.stderr)

log("Starting audio transcription...")

deepgram_key = os.environ.get('DEEPGRAM_API_KEY', '')
openai_key = os.environ.get('OPENAI_API_KEY', '')
audio_url = os.environ.get('AUDIO_URL', '')

if not audio_url:
    log("ERROR: AUDIO_URL is missing!")
    print(json.dumps({"transcript": "", "tags": [], "error": "AUDIO_URL is missing"}))
    sys.exit(0)

log(f"Audio URL: {audio_url[:100]}...")

# Whisper limit is 25 MB
WHISPER_LIMIT = 25 * 1024 * 1024

results = {
    "transcript": "",
    "tags": []
}

try:
    # Check file size first
    log("Checking file size...")
    head_response = requests.head(audio_url, timeout=10)
    file_size = int(head_response.headers.get('content-length', 0))
    log(f"File size: {file_size:,} bytes ({file_size / (1024*1024):.2f} MB)")
    
    # Use Whisper for small files, Deepgram for large files
    if file_size > 0 and file_size <= WHISPER_LIMIT:
        # Small file: Use OpenAI Whisper (better quality, cheaper)
        log(f"Using OpenAI Whisper for small file...")
        
        if not openai_key:
            log("ERROR: OPENAI_API_KEY is missing!")
            print(json.dumps({"transcript": "", "tags": [], "error": "OPENAI_API_KEY is missing"}))
            sys.exit(0)
        
        # Download file
        audio_response = requests.get(audio_url, timeout=60)
        audio_response.raise_for_status()
        
        audio_path = "/tmp/audio.mp3"
        with open(audio_path, "wb") as f:
            f.write(audio_response.content)
        
        # Transcribe with Whisper
        client = OpenAI(api_key=openai_key)
        with open(audio_path, "rb") as audio_file:
            transcript_response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
            results["transcript"] = transcript_response.text
            log(f"Whisper transcript length: {len(results['transcript'])} chars")
    
    else:
        # Large file: Use Deepgram (handles any size via URL)
        log(f"Large file ({file_size / (1024*1024):.1f} MB), using Deepgram...")
        
        if not deepgram_key:
            log("ERROR: DEEPGRAM_API_KEY is missing for large file!")
            print(json.dumps({"transcript": "", "tags": [], "error": "DEEPGRAM_API_KEY required for large audio files"}))
            sys.exit(0)
        
        deepgram_url = "https://api.deepgram.com/v1/listen"
        headers = {
            "Authorization": f"Token {deepgram_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "url": audio_url
        }
        params = {
            "model": "nova-2",
            "smart_format": "true",
            "punctuate": "true",
            "diarize": "false"
        }
        
        response = requests.post(
            deepgram_url,
            headers=headers,
            json=payload,
            params=params,
            timeout=120
        )
        response.raise_for_status()
        
        data = response.json()
        transcript = data.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("transcript", "")
        
        if transcript:
            results["transcript"] = transcript
            log(f"Deepgram transcript length: {len(transcript)} chars")
        else:
            log("No transcript returned from Deepgram")
            results["error"] = "No audio detected or transcription failed"
            results["tags"] = ["audio"]
            print(json.dumps(results))
            sys.exit(0)
    
    # Generate tags from transcript using OpenAI
    if results["transcript"] and openai_key:
        log("Generating tags from transcript with GPT-4o...")
        try:
            client = OpenAI(api_key=openai_key)
            tags_response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{
                    "role": "user",
                    "content": f"Based on this audio transcript: '{results['transcript'][:1000]}', generate 10-15 relevant tags describing the content, topics, genre, and mood. Return only the tags as a comma-separated list."
                }],
                max_tokens=150
            )
            tags_text = tags_response.choices[0].message.content
            results["tags"] = [tag.strip().lower() for tag in tags_text.split(",") if tag.strip()]
            log(f"Generated {len(results['tags'])} tags")
        except Exception as tag_error:
            log(f"Tag generation failed: {str(tag_error)}")
            results["tags"] = ["audio", "transcribed"]
    else:
        if not openai_key:
            log("No OpenAI key for tag generation, using basic tags")
        results["tags"] = ["audio", "transcribed"]

except Exception as e:
    error_msg = str(e)
    log(f"ERROR: {error_msg}")
    results["error"] = error_msg
    results["tags"] = ["audio", "error"]
    print(json.dumps(results))
    sys.exit(1)

log("Transcription complete!")
print(json.dumps(results))
`;

      const response = await sandbox.process.codeRun(transcriptionCode);

      console.log('🎵 [DAYTONA] Audio transcription raw response:', {
        exitCode: response.exitCode,
        resultLength: response.result?.length || 0,
        result: response.result?.substring(0, 500),
      });

      if (response.exitCode !== 0) {
        console.error('❌ [DAYTONA] Transcription failed with exit code:', response.exitCode);
        throw new Error(`Transcription failed: ${response.result}`);
      }

      try {
        const result = JSON.parse(response.result);
        
        console.log('🎵 [DAYTONA] Audio transcription result:', {
          hasTranscript: !!result.transcript,
          hasTags: !!result.tags,
          transcriptLength: result.transcript?.length || 0,
          tagsCount: result.tags?.length || 0,
          tags: result.tags,
          hasError: !!result.error,
          error: result.error || null,
        });
        
        // Return result even if there's an error - let the UI handle it
        if (result.error) {
          console.warn('⚠️ [DAYTONA] Audio analysis has error:', result.error);
          // Still return with tags and error message for user feedback
          return {
            transcript: '',
            tags: result.tags || ['audio'],
            error: result.error,
            analyzedAt: new Date(),
          };
        }
        
        if (!result.transcript || result.transcript.length === 0) {
          console.warn('⚠️ [DAYTONA] Transcript is empty!');
        }
        
        return result;
      } catch (parseError) {
        console.error('❌ [DAYTONA] Failed to parse transcription JSON:', response.result);
        throw new Error(`Transcription failed: Invalid JSON response`);
      }
    } finally {
      await sandbox.delete();
    }
  }

  /**
   * Analyze document (PDF, TXT, etc.) with AI
   */
  async analyzeDocument(documentUrl: string, mimeType: string): Promise<AIAnalysisResult> {
    const sandbox = await this.daytona.create(
      {
        envVars: {
          OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
          DOCUMENT_URL: documentUrl,
          MIME_TYPE: mimeType,
        },
      },
      { timeout: 0 }
    );

    try {
      const analysisCode = `
import os
import json
import requests
from openai import OpenAI

client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
document_url = os.environ['DOCUMENT_URL']
mime_type = os.environ.get('MIME_TYPE', 'application/pdf')

results = {
    "summary": "",
    "tags": [],
    "keyTopics": [],
    "documentType": "",
    "extractedText": ""
}

try:
    # Download document
    doc_response = requests.get(document_url)
    
    # Extract text based on document type
    extracted_text = ""
    
    if 'pdf' in mime_type:
        # For PDFs, use PyPDF2
        try:
            import PyPDF2
            from io import BytesIO
            
            pdf_file = BytesIO(doc_response.content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            # Extract text from all pages (limit to first 20 pages for performance)
            max_pages = min(20, len(pdf_reader.pages))
            for page_num in range(max_pages):
                page = pdf_reader.pages[page_num]
                extracted_text += page.extract_text() + "\\n"
                
        except Exception as pdf_error:
            print(f"PDF extraction error: {pdf_error}", file=sys.stderr)
            extracted_text = f"PDF content (binary, {len(doc_response.content)} bytes)"
            
    elif 'text' in mime_type:
        # Plain text document
        extracted_text = doc_response.text
    
    # Limit text for analysis (first 4000 chars)
    text_sample = extracted_text[:4000] if extracted_text else "Document content unavailable"
    results["extractedText"] = text_sample[:500]  # Store short sample
    
    # Analyze document with GPT
    analysis_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "system",
            "content": "You are an expert document analyst. Analyze the provided document text and extract key information."
        }, {
            "role": "user",
            "content": f"""Analyze this document and provide:
1. A concise summary (2-3 sentences)
2. 8-12 relevant tags/keywords
3. Main topics/themes (3-5 items)
4. Document type/category

Document text:
{text_sample}

Return as JSON with keys: summary, tags (array), keyTopics (array), documentType (string)"""
        }],
        response_format={"type": "json_object"},
        max_tokens=500
    )
    
    try:
        analysis_result = json.loads(analysis_response.choices[0].message.content)
        results.update(analysis_result)
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails - use text content
        results["summary"] = analysis_response.choices[0].message.content
    
    # Ensure tags are lowercase
    if 'tags' in results:
        results['tags'] = [tag.lower().strip() for tag in results['tags']]
    
except Exception as e:
    import sys
    print(f"Document analysis error: {str(e)}", file=sys.stderr)
    results["error"] = str(e)
    results["tags"] = ["document", "unanalyzed"]
    results["summary"] = f"Document uploaded ({mime_type})"

print(json.dumps(results))
`;

      const response = await sandbox.process.codeRun(analysisCode);

      if (response.exitCode !== 0) {
        console.error('Document analysis failed:', response.result);
        // Return basic analysis on failure
        return {
          tags: ['document'],
          caption: `Document uploaded (${mimeType})`,
        }
      }

      try {
        return JSON.parse(response.result);
      } catch (parseError) {
        console.error('Failed to parse document analysis JSON:', response.result);
        throw new Error(`Document analysis failed: Invalid JSON response`);
      }
    } finally {
      await sandbox.delete();
    }
  }

  /**
   * Generate text embedding for semantic search
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const sandbox = await this.daytona.create(
      {
        envVars: {
          OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
          TEXT_INPUT: text,
        },
      },
      { timeout: 0 }
    );

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

      try {
        const result = JSON.parse(response.result);
        return result.embedding;
      } catch (parseError) {
        console.error('Failed to parse embedding JSON:', response.result);
        throw new Error(`Embedding generation failed: Invalid JSON response`);
      }
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
