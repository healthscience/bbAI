import EventEmitter from 'events'
import { createBeeBee }  from 'beebee-agent'
import { getLlama } from 'node-llama-cpp'
import { MASTER_PROMPT, LENS_SCHEMA } from './prompts.js'

// This would be inside the beebee-ai package
class BeeBeeAgent extends EventEmitter {
  constructor() {
    super()
    this.beebee = null;
    this.grammar = null;
    this.llama = null;
    // this.websocketClients = new Set(); // BentoBoxDS connections
  }
  
  async initialize() {
    // Create BeeBee instance with BentoBoxDS system prompt
    this.beebee = await createBeeBee({
      temperature: 0.7,
      maxTokens: 512,
      systemPrompt: MASTER_PROMPT
    });

    await this.beebee.initialize();
    this.llama = this.beebee.getLlama();

    this.grammar = await this.llama.createGrammarForJsonSchema(LENS_SCHEMA);
    
    // Set up event listeners
    this.beebee.on('ready', () => {
      this.broadcastToClients({ type: 'llm_ready' });
    });

    // If already initialized, emit ready
    if (this.beebee.isInitialized) {
      this.broadcastToClients({ type: 'llm_ready' });
    }
    
    this.beebee.on('token', (token, receivedBboxID) => {
      // Stream tokens to BentoBoxDS clients
      this.broadcastToClients({
        type: 'token',
        data: token,
        bboxid: receivedBboxID
      });
    });
    
    this.beebee.on('response', (fullResponse) => {
      // Send complete response
      this.broadcastToClients({
        type: 'response_complete',
        data: fullResponse
      });
    });
    
    this.beebee.on('error', (error) => {
      console.error('❌ BeeBee error:', error);
      this.broadcastToClients({
        type: 'error',
        error: error.message
      });
    });
  }
  
  // Called when receiving message from BentoBoxDS
  async handleBentoBoxMessage(message, bboxID) {
    const { type, prompt, options = {} } = message;

    let fullResponse = '';
    const tokensWithBboxID = [];

    const onToken = (token, tokenBboxID) => {
      fullResponse += token;
      tokensWithBboxID.push({ token, bboxid: tokenBboxID });
    };
  
    switch (type) {
      case 'prompt':
        // Non-streaming prompt
        if (options.grammar === 'lens') {
          options.grammar = this.grammar;
        }
        await this.beebee.prompt(prompt, options, bboxID);
        break;
        
      case 'prompt_stream':
        // Streaming prompt
        if (options.grammar === 'lens') {
          options.grammar = this.grammar;
        }
        await this.beebee.promptStream(prompt, options, onToken, bboxID);
        break;
        
      default:
        console.log('Unknown message type:', type);
    }
  }
  
  // Simulate broadcasting to websocket clients
  broadcastToClients(message) {
    this.emit('beebee-agent-reply', message)
  }
  
  async dispose() {
    if (this.beebee) {
      await this.beebee.dispose();
    }
  }
}

export default BeeBeeAgent
