import OpenAI from 'openai';

// Define the structure of an AI suggestion
export interface AISuggestion {
  type: string;
  title: string;
  content: string;
  emoji: string;
}

// Define the structure for document context
export interface DocumentContext {
  summary: string;
  commentary: string;
  lastProcessedLength: number;
}

class OpenAIService {
  private openai: OpenAI | null = null;
  private initialized = false;
  private documentContext: DocumentContext = {
    summary: '',
    commentary: '',
    lastProcessedLength: 0
  };
  private chattiness: number = 0.5; // Default chattiness (0-1 scale)
  
  /**
   * Initialize the OpenAI client with the API key
   */
  private initializeClient(): void {
    if (this.initialized) return;
    
    try {
      // Try to get API key from localStorage first, then fall back to environment variable
      const localStorageApiKey = typeof localStorage !== 'undefined' ? localStorage.getItem("openai_api_key") : null;
      const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const apiKey = localStorageApiKey || envApiKey;
      
      // Try to get chattiness from localStorage
      const storedChattiness = typeof localStorage !== 'undefined' ? localStorage.getItem("muse_chattiness") : null;
      if (storedChattiness) {
        this.chattiness = parseFloat(storedChattiness);
      }
      
      if (apiKey) {
        this.openai = new OpenAI({
          apiKey,
          dangerouslyAllowBrowser: true // Allow usage in browser
        });
      }
    } catch (error) {
      console.error('Error initializing OpenAI client:', error);
    } finally {
      this.initialized = true;
    }
  }
  
  /**
   * Set the chattiness level (0-1)
   */
  setChattiness(level: number): void {
    this.chattiness = Math.max(0, Math.min(1, level));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem("muse_chattiness", this.chattiness.toString());
    }
  }
  
  /**
   * Get the current chattiness level
   */
  getChattiness(): number {
    return this.chattiness;
  }

  /**
   * Check if the OpenAI client is initialized
   */
  isInitialized(): boolean {
    this.initializeClient();
    return this.openai !== null;
  }

  /**
   * Update the document context based on new content
   */
  async updateDocumentContext(content: string): Promise<void> {
    this.initializeClient();
    
    if (!this.openai || content.length < 100 || content.length <= this.documentContext.lastProcessedLength) {
      return;
    }
    
    // Only update if content has grown significantly
    if (content.length - this.documentContext.lastProcessedLength < 200) {
      return;
    }
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert literary analyst. Your task is to maintain a running summary and commentary of a document as it's being written.
            
            Current summary: ${this.documentContext.summary || "No summary yet."}
            Current commentary: ${this.documentContext.commentary || "No commentary yet."}
            
            Based on the new content, update the summary and provide insightful commentary about themes, character development, plot progression, etc.
            
            Your response must be in the following JSON format:
            {
              "summary": "A concise summary of the entire document (max 200 words)",
              "commentary": "Your literary analysis and observations (max 200 words)"
            }`
          },
          {
            role: 'user',
            content: `Here is the current document content:
            
            ${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });

      const responseContent = response.choices[0]?.message.content;
      if (!responseContent) {
        throw new Error('Empty response from OpenAI');
      }

      const contextUpdate = JSON.parse(responseContent);
      this.documentContext = {
        summary: contextUpdate.summary,
        commentary: contextUpdate.commentary,
        lastProcessedLength: content.length
      };
    } catch (error) {
      console.error('Error updating document context:', error);
    }
  }

  /**
   * Generate suggestions based on the provided content
   */
  async generateSuggestions(content: string): Promise<AISuggestion[]> {
    this.initializeClient();
    
    if (!this.openai) {
      console.error('OpenAI client not initialized. Please provide an API key.');
      return [];
    }

    try {
      // Determine how many suggestions to request based on chattiness
      const maxSuggestions = Math.max(1, Math.round(this.chattiness * 3));
      
      // Prepare context for the API call
      let contextToSend = content;
      
      // If content is too long, trim it but include the summary
      const MAX_CONTENT_LENGTH = 2000;
      if (content.length > MAX_CONTENT_LENGTH) {
        // Get the last MAX_CONTENT_LENGTH characters
        contextToSend = content.slice(-MAX_CONTENT_LENGTH);
        
        // Update document context if needed
        await this.updateDocumentContext(content);
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a world-famous author and editor, a master of literature with decades of experience. 
            You serve as a polite, humble, insightful, and encouraging advisor to writers.
            
            ${this.documentContext.summary ? `Document summary: ${this.documentContext.summary}` : ''}
            ${this.documentContext.commentary ? `Literary analysis: ${this.documentContext.commentary}` : ''}
            
            Analyze the writer's text and provide ${maxSuggestions > 1 ? `1-${maxSuggestions}` : 'one'} helpful suggestions. Choose the most appropriate types of suggestions based on what you think would be most helpful at this point in their writing.
            
            Your response must be in the following JSON format:
            {
              "suggestions": [
                {
                  "type": "A short label for the type of suggestion (e.g., 'style', 'character', 'plot', 'theme', 'pacing', etc.)",
                  "title": "A brief, engaging title for your suggestion",
                  "content": "Your actual suggestion, advice, or question. Be specific, constructive, and encouraging. Keep it concise (max 150 words).",
                  "emoji": "A single emoji that best represents this type of suggestion"
                }
                // Additional suggestions as needed
              ]
            }
            
            Examples of suggestion types (but don't limit yourself to these):
            - Style improvements
            - Character development
            - Plot direction
            - Thematic exploration
            - Pacing adjustments
            - Dialogue enhancement
            - Setting enrichment
            - Emotional resonance
            - Reader engagement
            - Structural considerations
            
            Remember to be constructive, specific, and encouraging. Your goal is to inspire and guide, not criticize.
            
            The number of suggestions you provide should be appropriate to the context - sometimes one deep insight is better than multiple surface-level comments.`
          },
          {
            role: 'user',
            content: `Here is my current writing. Please provide helpful suggestions:
            
            ${contextToSend}`
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      });

      const responseContent = response.choices[0]?.message.content;
      if (!responseContent) {
        throw new Error('Empty response from OpenAI');
      }

      const parsedResponse = JSON.parse(responseContent);
      return parsedResponse.suggestions || [];
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const openAIService = new OpenAIService();
