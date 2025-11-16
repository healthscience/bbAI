import EventEmitter from 'events'
import { createBeeBee }  from 'beebee-agent'

// This would be inside the beebee-ai package
class BeeBeeAgent extends EventEmitter {
  constructor() {
    super()
    this.beebee = null;
    // this.websocketClients = new Set(); // BentoBoxDS connections
  }
  
  async initialize() {
    // Create BeeBee instance with BentoBoxDS system prompt
    this.beebee = await createBeeBee({
      temperature: 0.7,
      maxTokens: 512
    });
    
    // Set up event listeners
    this.beebee.on('ready', () => {
      this.broadcastToClients({ type: 'llm_ready' });
    });
    
    this.beebee.on('token', (token) => {
      // Stream tokens to BentoBoxDS clients
      this.broadcastToClients({
        type: 'token',
        data: token
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
  async handleBentoBoxMessage(message) {
    const { type, prompt, options = {} } = message;
    
    switch (type) {
      case 'prompt':
        // Non-streaming prompt
        await this.beebee.prompt(prompt, options);
        break;
        
      case 'prompt_stream':
        // Streaming prompt
        await this.beebee.promptStream(prompt, options);
        break;
        
      default:
        console.log('Unknown message type:', type);
    }
  }
  
  // Simulate broadcasting to websocket clients
  broadcastToClients(message) {
    this.emit('beebee-agent-reply', message)
    // In real implementation, this would send via websocket
    // this.websocketClients.forEach(client => {
    //   client.send(JSON.stringify(message));
    // });
  }
  
  async dispose() {
    if (this.beebee) {
      await this.beebee.dispose();
    }
  }
}

export default BeeBeeAgent
