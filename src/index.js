'use strict'
/**
*  beebee orchestration agent
*
*
* @class BbAI
* @package    bbAI-interface
* @copyright  Copyright (c) 2024 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import EventEmitter from 'events'
import BeebeeAgent from './beebeeAgent/beebeeLearn.js'
import AgentNetwork from './agents/networkAgents.js'
import BlindData from './data/blindData.js'
import HopQuerybuider from 'hop-query-builder'
import BeSearch from './besearch/index.js'
import ContextHelp from './context/contextHelper.js'
import HopDML from 'hop-dml'

class BbAI extends EventEmitter {

  constructor(xlibrary) {
    super()
    this.hello = 'beebee-AI--{{hello}}'
    this.publicLibrary = {}
    this.nxtLibrary = xlibrary
    this.beebeeAgent = new BeebeeAgent();
    this.queryBuilder = new HopQuerybuider()
    this.beSearch = new BeSearch()
    this.agentsCMP = new AgentNetwork()
    this.blindData = new BlindData(this.nxtLibrary)
    this.hopDML = new HopDML(this.nxtLibrary)
    this.peerQ = ''
    this.contextHelper = new ContextHelp()
    this.gatherAI()
    this.listenToHOP()
    this.listenBeeBeeAgent()
    this.listenAssessedResponse()
    this.listenOracle()
  }

  /**
  * listener for Holepunch hypercore live and activve
  * @method listenHolepunchLive
  *
  */
  listenHolepunchLive = async function () {
    this.publicLibrary = await this.libraryRefContracts()
    // ask the oracle if anything to bring to attention
    await this.beSearch.listenOracles()
  }

  /**
  * bring AI's to be
  * @method gatherAI
  *
  */
  gatherAI = function () {
    this.contextHelper.setHopLearn(this.agentsCMP.hopLearn)
    this.agentsCMP.setHopLearn()
  }

  /**
  * coordinate between AI and SafeFlow or other ai's
  * @method coordinationDML
  *
  */
  coordinationDML = async function (message) {
    // prepare proof of work and message to network peer
    console.log('pare Proof of work')
    this.hopDML.powEvidence(message)
  }

  /**
  * listen for message back from HOP
  * @method listenToHOP
  *
  */
  listenToHOP = async function () {
    // prepare proof of work and message to network peer
    this.on('safeflow-success', (data) => {
      // inform beebee this HOPquery was fullfilled.
    })
  }


  /**
  * listen to beebee agent
  * @method listenBeeBeeAgent
  *
  */
  listenBeeBeeAgent = function () {
    this.beebeeAgent.on('beebee-agent-reply', (data) => {
      if (data.type === 'response_complete') {
        // inform bentobox of complete reply and save in chat history via BentoBoxDS
        console.log('complete beebee response')
        console.log(data)
      } else if (data.type === 'token') {
        // pass on to assessment and then allow streaming part back to bentoboxds
        // this.emit('beebee-response-stream', data)
        this.emit('beebee-pre-response', data)
      }
    })
  }

  /**
  * NLP conversation with beebee who will then coordinate with other peers or tiny agents to give best response back to peer via BentoBoxDS
  * @method nlpflow
  *
  */
  beebeeFlow = async function (inFlow) {
    console.log('beebeeFLOW')
    console.log(inFlow)
    // does a new chat session need start and or chat history added?
    if (inFlow.data.session === true) {
      this.beebeeAgent.startNewChatSession(inFlow.bbid)
    }
    // take quick look with beebee own bentoboxDS NLP skills
    let firstReview = await this.contextHelper.inputLanuage(inFlow.data.data.text, inFlow)
    console.log('quick context gather and plan action')
    console.log(firstReview)
    // beebee has to decide on best info gathering paths.
    // check for tools use
    let toolUse = false
    if (inFlow.data.data.tools.length > 0) {
      toolUse = true
    }
    // start action based on tool
    let uploadTools = false
    if (toolUse === true) {
      for (let tool of inFlow.data.data.tools ) {
        if (tool === 'upload') {
          uploadTools = true
        }
      }
    }
    // hand data uploads
    let dataBlindOptions = false
    if (uploadTools ===  true) {
      // look if tools were used e.g. file upload or api to email or call other agent tools?
      let blindFileStatus = {}
      blindFileStatus = await this.blindData.filePreviewData(inFlow.data, inFlow.bbid)
      console.log(blindFileStatus)
      if (blindFileStatus.type === 'blindfile-data') {
        dataBlindOptions = true
        let outFlow = {}
        outFlow.type = 'bbai'
        outFlow.action = 'npl-reply'
        outFlow.bbid = inFlow.bbid
        outFlow.query = false
        outFlow.data = blindFileStatus
        this.emit('beebee-response', outFlow)
      } else if (blindFileStatus.type === 'blindfile-none') {
        this.emit('beebee-response', blindFileStatus.message)
      }
    }

    // check if a HOPquery is ready for SafeFlow-ECS?
    if (dataBlindOptions === false && firstReview.bentobox === true && uploadTools === false) {
      console.log('pass rororoororo anandannadn')
      // save the squency data to a blind file
      let blindFileName = 'blindt' + inFlow.bbid
      await this.nxtLibrary.liveHolepunch.DriveFiles.hyperdriveJSONsaveBlind(blindFileName, JSON.stringify(firstReview.data.sequence))
      let queryData = await this.HOPqueryDataPrep(inFlow.data.data.text, firstReview.data, inFlow.bbid)
      console.log('HOPquery perp over ========')
      console.log(queryData)
      this.emit('beebee-response', queryData)
    } else if (dataBlindOptions === false && firstReview.bentobox === true && uploadTools === true)  {
      // data file already saved on upload, identify by name and file type and blind prefix
      let queryData = await this.HOPqueryDataPrep(inFlow.data.data.text, firstReview.data, inFlow.bbid)
      this.emit('beebee-response', queryData)
    }

    // pull together all parts and ask beebeee to build response
    let beebeePrompt = {}
    beebeePrompt.rawinput = inFlow.data.data.text
    if (firstReview.bentobox === true) {
      // send HOPquery to HOP
      beebeePrompt.mode = 'hopquery'
      beebeePrompt.task = 'a HOPquery has been prepared.'
      // upload
      if (uploadTools === true) {
        beebeePrompt.upload = 'Thank you for the file data'
        // action reply
        beebeePrompt.reply = 'Please produce very short reply informing peer bentobox has been prepared.'
        // serialize object for LLM
        let serializePrompt = JSON.stringify(beebeePrompt) // this.serializeJSobject(beebeePrompt)
        console.log(serializePrompt)
        // give beeebee the context to reply to
        await this.beebeeMain(serializePrompt, inFlow.bbid)
        // beebee will emit response
      }
    } else {
      let queryBeeBee = JSON.stringify(beebeePrompt)
      console.log(queryBeeBee)
      // none HOPquery, process as question for TINY agent beebee
      await this.beebeeMain(queryBeeBee, inFlow.bbid)
    }
  }

  /**
  *
  * @method  serializeJSobject
  */
  serializeJSobject = function (obj) {
    let result = '';
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result += `${key}=${encodeURIComponent(obj[key])}&`;
      }
    }
    return result.slice(0, -1);
  }

  /**
  * prepare data for HOPquery
  * @method HOPqueryDataPrep
  *
  */
  HOPqueryDataPrep = async function (question, contextData, bboxid) {   
    let outFlow = {}
    outFlow.type = 'hopquery'
    outFlow.text = question
    outFlow.query = true
    outFlow.bbid = bboxid
    // need to  assume question, data, compute and vis contracts need form if from NLP first time.
    let hqbHolder = {}
    hqbHolder.action = 'blind'
    hqbHolder.data = contextData.sequence.data
    hqbHolder.compute = contextData.compute[0].compute
    let blindFileName = 'blindt' + bboxid
    // first check public library is present if not ask for it again
    let setAlready = Object.keys(this.publicLibrary)
    if (setAlready.length === 0) {
      await this.listenHolepunchLive()
      let safeFlowQuery = this.queryBuilder.queryPath(hqbHolder, this.publicLibrary, blindFileName)
      outFlow.data = safeFlowQuery
    } else {
      let safeFlowQuery = this.queryBuilder.queryPath(hqbHolder, this.publicLibrary, blindFileName)
      outFlow.data = safeFlowQuery
    }
    return outFlow
  }

  /**
  * listen for assessed response
  * @method listenAssessedResponse
  *
  */
  listenAssessedResponse = async function () {
    // this.contextHelper.on('assessed-response', async (bbResponseCategory, bbox) => {
      // did the LLM provide numbers to chart, extract date information from questions etc.?
      // save to hyperdrive
      /*
      let blindFileName
      if (bbResponseCategory.type !== 'agent-response' && bbResponseCategory.type !== undefined && bbResponseCategory.type !== 'hello' && bbResponseCategory.type !== 'upload' && bbResponseCategory.type !== 'library' && bbResponseCategory.type !== 'library-open') {
        blindFileName = 'blindt' + bbox
        await this.nxtLibrary.liveHolepunch.DriveFiles.hyperdriveJSONsaveBlind(blindFileName, JSON.stringify(bbResponseCategory.data.sequence))
      }
      await this.outflowPrepare(bbResponseCategory, bbox, blindFileName)
      */
    // })
    // file upload
    /* 
    this.on('assessed-response', async (bbResponseCategory, bbox, blindFileName) => {
      // did the LLM provide numbers to chart, extract date information from questions etc.?
      await this.outflowPrepare(bbResponseCategory, bbox, blindFileName)
    })
    */
    // assess all part of beebee reply and pass on streaming output back to bentoboxds
    this.on('beebee-pre-response', (token) => {
      // console.log('token---------------')
      // console.log(token)
      // look for consider reply part of stream
      let outPutMessage = true
      if (token.data === 'ouput') {
        outPutMessage = true
      }
      if (outPutMessage === true) {
        this.emit('beebee-response-stream', token)
      }
    })

  }

  /**
  * oracle events to listen for
  * @method listenOracle
  *
  */
  listenOracle = async function () {
    this.beSearch.on('oracle', async (oracleData) => {
      let outFlow = {}
      outFlow.type = 'oracle'
      outFlow.action = 'oracle-attention'
      outFlow.bbid = ''
      outFlow.data = oracleData
      this.emit('beebee-response', outFlow)
    })
  }

  /**
  * format ready for return 
  * @method outflowPrepare
  *
  */
  outflowPrepare = async function (bbResponseCategory, bbox, blindFileName) {
    // need rules outFlow logic to order reponse and append data where relevant.
    let outFlow = {}
    outFlow.type = 'bbai'
    outFlow.action = 'npl-reply'
    outFlow.bbid = bbox
    if (bbResponseCategory.type === 'hello') {
      outFlow.type = 'hello'
      outFlow.text = bbResponseCategory.text
      outFlow.query = false
      outFlow.data = bbResponseCategory.data
    } else if (bbResponseCategory.type === 'agent-response') {
      outFlow.type = 'agent-response'
      outFlow.text = bbResponseCategory.text
      outFlow.query = false
      outFlow.data = bbResponseCategory.data
    } else if (bbResponseCategory.type === 'hopquery') {
      outFlow.type = 'hopquery'
      outFlow.text = bbResponseCategory.text
      outFlow.query = true
      if (bbResponseCategory.data.sequence.status !== true) {
        outFlow.data = bbResponseCategory.sequence.data
      } else {
        // need to  assume question, data, compute and vis contracts need form if from NLP first time.
        /*let hqbHolder = {}
        hqbHolder.action = 'blind'
        hqbHolder.data = bbResponseCategory
        // first check public library is present if not ask for it again
        let setAlready = Object.keys(this.publicLibrary)
        if (setAlready.length === 0) {
          await this.listenHolepunchLive()
          let safeFlowQuery = this.queryBuilder.queryPath(hqbHolder, this.publicLibrary, blindFileName)
          outFlow.data = safeFlowQuery
        } else {
          let safeFlowQuery = this.queryBuilder.queryPath(hqbHolder, this.publicLibrary, blindFileName)
          outFlow.data = safeFlowQuery
        } */
      }
    } else if (bbResponseCategory.type === 'upload') {
      outFlow.type = 'upload'
      outFlow.text = bbResponseCategory.text
      outFlow.query = false
      outFlow.data = bbResponseCategory.data
    } else if (bbResponseCategory.type === 'library' || bbResponseCategory.type === 'library-open') {
      outFlow.type = 'library'
      outFlow.text = bbResponseCategory.text
      outFlow.query = false
      outFlow.data = bbResponseCategory.data
    } else if (bbResponseCategory.type === 'knowledge') {
      outFlow.type = 'knowledge'
      outFlow.text = bbResponseCategory.text
      outFlow.query = false
      outFlow.data = bbResponseCategory.data
    } else if (bbResponseCategory.type === 'help') {
      outFlow.type = 'help'
      outFlow.text = bbResponseCategory.text
      outFlow.query = false
      outFlow.data = bbResponseCategory.data
    } else if (bbResponseCategory.type === 'sorry') {
      outFlow.text = 'Sorry beebee is unable to help.'
      outFlow.query = false
      outFlow.data = 'Sorry beebee is unable to help.'
    } else if (bbResponseCategory.type === 'prompt') {
      outFlow.text = 'Could you state the day of the week/month, year etc?'
      outFlow.query = false
      outFlow.data = bbResponseCategory.data
    } else {
      outFlow.query = false
      outFlow.data = 'sorry beebee cannot help.  beebee is still learning.'
    }
    this.emit('beebee-response', outFlow)
  }

  /**
  * get starting ref contracts from public library
  * @method libraryRefContracts
  *
  */
  libraryRefContracts = async function () {
    let publicLibrary = {}
    publicLibrary = await this.nxtLibrary.liveHolepunch.BeeData.getPublicLibraryRange()
    return publicLibrary
  }

  /**
  * message from peer network direct
  * @method networkPeerdirect
  *
  */
  networkPeerdirect = function (data) {
    let outFlow = {}
    outFlow.type = 'network-notification'
    outFlow.action = 'chart'
    outFlow.text = ' peer has sent chart data'
    outFlow.query = false
    // outFlow.bbid = data.hop.bbid
    outFlow.data = data
    this.emit('peer-bb-direct', outFlow)
  }

  /**
  * message to space share
  * @method networkPeerSpace
  *
  */
  networkPeerSpace = function (data) {
    let outFlow = {}
    outFlow.type = 'network-notification'
    outFlow.action = 'cue-space'
    outFlow.text = 'a peer has shared a cue space'
    outFlow.query = false
    outFlow.bbid = 'cue-space' // data.hop.bbid
    outFlow.data = data
    this.emit('peer-bb-direct', outFlow)
  }

  /**
  * what can be learnt from language 
  * @method languageAgent
  *
  */
  languageAgent = function (words) {
    let bbResponseCategory = this.contextHelper.inputLanuage(words)
    return bbResponseCategory
  }

  /**
  * Ask other AI agents / models 
  * @method aiAsk
  *
  */
  aiAsk = function () {
    let outFlow = {}
    outFlow.type = 'beebee-predict'
    outFlow.action = 'prediction'
    let caleReply = '' // need to call AI
    if (caleReply === 'no-prediction') {
      outFlow.data = 'This is not operational yet, still testing' // call prediction flow
    }
    return outFlow
  }

  /**
  * manage a future prediction
  * @method managePrediction
  *
  */
  managePrediction = function (message) {
    // what context set  free text or specific model
    // file assume dto deal with??????????let languageContext = this.languageAgent(message.data.question)
    // has a specific model been asked for
    let safeFlowQuery = {}
    if (message.data.model === 'linear-regression') {
      let hqbHolder = {}
      hqbHolder.action = 'future'
      hqbHolder.data = message.data.nxp  // languageContext
      let futureFileName = 'future-' + message.bbid
      safeFlowQuery = this.queryBuilder.queryPath(hqbHolder, this.publicLibrary, futureFileName)
    } else if (message.data.model === 'autoregression') {

    } else if (message.data.model === 'finetuning') {

    } else if (message.data.model === 'foundational') {

    }
    let outFlow = {}
    outFlow.type = 'beebee-predict'
    outFlow.action = 'prediction'
    outFlow.data = safeFlowQuery
    return outFlow
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
  beebeeMain = async function (promptIN, bboxID) {
    // Simulate receiving messages from BentoBoxD
    await this.beebeeAgent.handleBentoBoxMessage({
      type: 'prompt_stream',
      prompt: promptIN
    }, bboxID);
    
    // Clean up
    // await this.beebeeAgent.dispose();  clean up at end of bentoboxDS use?
  }

}

export default BbAI
