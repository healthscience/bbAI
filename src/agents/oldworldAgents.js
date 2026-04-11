import BeebeeAgent from './beebeeAgent/beebeeLearn.js'
import { MASTER_PROMPT, TASK_PROMPTS } from "./beebeeAgent/prompts.js";
import { processResponse, StreamFilter } from "./beebeeAgent/handler.js";


class OldAgents extends EventEmitter {

  constructor() {
    super()
    this.beebeeAgent = new BeebeeAgent()
  }

  /**
  *  bring TINY LLM to be
  * @method startBeeBee
  *
  */
  startBeeBee = async function () {
    await this.beebeeAgent.initialize();
  }

  /**
  *  call beebee tiny llm
  * @method beebeeMain
  *
  */
  beebeeMain = async function (promptIN, bboxID, options = {}) {
    // Simulate receiving messages from BentoBoxD
    await this.beebeeAgent.handleBentoBoxMessage({
      type: 'prompt_stream',
      prompt: promptIN,
      options: options
    }, bboxID);
    
    // Clean up
    // await this.beebeeAgent.dispose();  clean up at end of bentoboxDS use?
  }

  /**
  * listen to beebee agent
  * @method listenBeeBeeAgent
  *
  */
  listenBeeBeeAgent = function () {
    let streamFilter = new StreamFilter();

    this.beebeeAgent.on('beebee-agent-reply', async (data) => {
      if (data.type === 'response_complete') {
        // inform bentobox of complete reply and save in chat history via BentoBoxDS

        let processed;
        if (this.currentTask === 'LENS_EXTRACTION') {
           try {
             // The data.data is the full response from the model
             const rawText = data.data || '';
             const parsed = JSON.parse(rawText.trim());
             processed = [{
               type: 'lens-extraction',
               lens: parsed
             }];
           } catch (e) {
             console.error('Failed to parse grammar response:', e);
             processed = [{ type: 'chat-reply', text: data.data }, { type: 'lens-extraction', lens: { state: 'Neutral' } }];
           }
           this.currentTask = null;
        } else {
           // Process the response using the new handler
           processed = await processResponse(data || data.response || data.data || '', this.peerQ);
        }
        
        // Emit each processed message separately
        processed.forEach(msg => {
          let outFlow = {
            type: 'bbai-reply',
            action: 'npl-reply',
            task: msg.type,
            bbid: data.bbid,
            query: false,
            data: msg
          };
          this.emit('beebee-response', outFlow);
        });

        // Reset stream filter for next turn
        streamFilter = new StreamFilter();

      } else if (data.type === 'token') {
        // pass on to assessment and then allow streaming part back to bentoboxds
        const cleanToken = streamFilter.process(data.data || '');
        if (cleanToken) {
          this.emit('beebee-pre-response', { ...data, data: cleanToken });
        }
      }
    })
  }


  /**
   * 
   * 
   */
  routeSmallLLM = function () {
        /*  standing down small LLM
    if (inFlow.data.session === true) {
      this.beebeeAgent.beebee.startNewChatSession(inFlow.bbid, MASTER_PROMPT)
    }

    // Check for skill routing (e.g., skill: rdf)
    if (inFlow.data.content && (inFlow.data.content.includes('skill: rdf') || inFlow.data.content.includes('skill - rdf'))) {
      const rdfMatch = inFlow.data.content.match(/(?:https?:\/\/|www\.)[^\s]+\.ttl/i) || inFlow.data.content.match(/(?:https?:\/\/|www\.)[^\s]+/i);
      if (rdfMatch) {
         await this.handleSkillRequest({
           skill: 'rdf',
           params: { rdfUrl: rdfMatch[0], subjectUri: inFlow.data.subjectUri || null },
           bbid: inFlow.bbid
         });
         return;
      }
    }
    */

    // check if a HOPquery is ready for SafeFlow-ECS?
    /*  new SafeFlow-ECS  pulse  needs updating
    if (dataBlindOptions === false && firstReview.bentobox === true && uploadTools === false) {
      // save the squency data to a blind file
      let blindFileName = 'blindt' + inFlow.bbid
      console.log('holepuch')
      await this.dataNetworkLive.DriveFiles.hyperdriveJSONsaveBlind(blindFileName, JSON.stringify(firstReview.data.sequence))
      let queryData = await this.HOPqueryDataPrep(inFlow.data.content, firstReview.data, inFlow.bbid)
      this.emit('beebee-response', queryData)
    } else if (dataBlindOptions === false && firstReview.bentobox === true && uploadTools === true)  {
      // data file already saved on upload, identify by name and file type and blind prefix
      let queryData = await this.HOPqueryDataPrep(inFlow.data.content, firstReview.data, inFlow.bbid)
      this.emit('beebee-response', queryData)
    }
    if (inFlow.data.context === 'extraction') {
      // Step 2: Extraction
      this.currentTask = 'LENS_EXTRACTION';
      const extractionPrompt = `${MASTER_PROMPT}\n${TASK_PROMPTS.CONTEXT_EXTRACTION}\n\nInput: "${inFlow.data.content}"`;
      await this.beebeeMain(extractionPrompt, inFlow.bbid, {
        grammar: 'lens',
        temperature: 0.2,
        maxTokens: 128
      });
    } else {
      // pull together all parts and ask beebeee to build response
      this.currentTask = 'PEER_REPLY';
      await this.beebeeMain(inFlow.data.content, inFlow.bbid);
    }
    */
  }
}

export default OldAgents