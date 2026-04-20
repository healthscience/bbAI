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
import HopLearn from 'hop-learn'
import BlindData from './data/blindData.js'
import HopQuerybuider from 'hop-query-builder'
import BeSearch from './besearch/index.js'
import ContextHelp from './context/contextHelper.js'
import HopDML from 'hop-dml'

// Brain imports
import { initializeMemory, Memory } from './brain/memory.js'
import { AltruismHandler } from './brain/altruismHandler.js'
import { CatalystProfiles } from './brain/catalystProfiles.js'
import { MetabolicValve } from './brain/metabolicValve.js'
import { MetabolicGovernor } from './brain/metobolicGovernor.js'
import { PatternAgent } from './brain/patternAgent.js'
import { TrinityManager } from './brain/trinityManager.js'
import { initializeContext } from './brain/context.js'

// Skill imports
import { RDFNavigator } from './skills/RDFmapper.js'
import { DataMapper } from './skills/dataMapper.js'
import { LexiconHarvester } from './skills/lexiconHarvester.js'
import { Teach } from './skills/teach.js'

class BbAI extends EventEmitter {

  constructor(wiringIn) {
    super()
    this.hello = 'beebee-AI--{{hello}}'
    this.publicLibrary = {}
    this.wiring = wiringIn
    this.liveLearn = new HopLearn()
    this.queryBuilder = new HopQuerybuider()
    this.beSearch = new BeSearch()
    // this.agentsCMP = new AgentNetwork()
    this.blindData = new BlindData({})
    this.hopDML = new HopDML({})
    this.peerQ = ''
    this.currentTask = null
    this.contextHelper = new ContextHelp()

    // Pass this.wiringAgent into context.js
    initializeContext(this.wiring.safeflow)
    initializeMemory(this.wiring.network)

    // Expose Brain
    this.brain = {
      Memory,
      AltruismHandler,
      CatalystProfiles,
      MetabolicValve,
      MetabolicGovernor,
      PatternAgent,
      trinityManager: TrinityManager
    }

    // Expose Skills
    this.skills = {
      rdfNavigator: RDFNavigator,
      dataMapper: DataMapper,
      lexiconHarvester: LexiconHarvester,
      // NetworkQuery,
      Teach
    }

    // Pass contextAgent to LexiconHarvester
    this.skills.lexiconHarvester.init(this.wiring.network);

    // start listeners
    this.listenToHOP()
    this.listenAssessedResponse()
    this.listenOracle()
  }

  /**
   * 
   * @method bringToBe
   * 
  */
  bringToBe = async function (bePulse, lsStory) {
    // beebee  bring to be a lifestrap
    console.log('new lifestrap  interplay with  resonAgents commences')
    console.log('----------------')

    if (bePulse !== 'awake') {
      console.log('lifestrap bring to be---awake----')
      // Ensure we have a valid key
      const agentKey = lsStory.key || 'default-agent';
      
      // 1. Birth the Language Agent
      const langAgent = await this.wiring.resonagents.birthAgent(agentKey, 'language');

      // 2. Feed the Raw Story (Preparation)
      // We pack the string into a Buffer or a standardized token array
      const rawWords = lsStory.value?.concept?.story || lsStory.value || '';
      // Feed 1: The Raw Story Words (The Intent)
      this.wiring.resonagents.feed(agentKey, 'language', rawWords);


      // life-straps
      // memory cues  network experiments(bentobox(s), reference contracts q, datatype, packing, compute, visualization)
      // form query to hypberbees using 
      /* let contractCatgory = ['cue', 'datatype', 'compute', 'packaging']
      for (let catC of contractCatgory) {

      } */
      
      // bring neat-hop to be

      // from memory saved
      if (bePulse === 'genesis') {
        let patternMatch = this.liveLearn.lifeFlow(rawWords, 'HomeoRange');
        this.prepareLifestrapLens(lsStory.key, patternMatch)

        // 3. Feed the Pattern Structure (Preparation)
        // We don't send the whole JSON; we send the 'Slots' and 'Resonance'
        // Feed 2: The Structured Pattern (from hop-learn)
        this.wiring.resonagents.feed(lsStory.key, 'language', patternMatch);
        // memory of dialogue conversations
        // same key for conversation ie chat

        // SafeFlow-ECS  set the data pulse into motion


        // consilience-weave

        // besearch cycles - heli time triggered
      } else {
        // feedback safeflow with saved data and setup data pulse for entity
      }

    } else {
      console.log('start path-----lifestrap')
      // memory of life-straps
      let lifeStrapbe = {}
      lifeStrapbe.type = 'bentoboxds'
      lifeStrapbe.action = 'lifestrap-start'
      this.wiring.library.libManager.bentoPathOperations(lifeStrapbe)
    } 
    
  }

  /**
   * 
   * @method prepareLifestrapLens
  */
   prepareLifestrapLens = function (lsKey, pattern) {
      let Lens = {}
      Lens.capacity = [],
      Lens.context = pattern,
      Lens.coherence = []
      Lens.key = lsKey
      this.emit('ls-pattern', Lens)
   }

  /**
  * listener for Holepunch hypercore live and activve
  * @method listenHolepunchLive
  *
  */
  listenHolepunchLive = async function () {
    this.publicLibrary = {} // await this.libraryRefContracts()
    // ask the oracle if anything to bring to attention
    await this.beSearch.listenOracles()
  }

  /**
  * path to old world
  * @method oldWorldPath
  *
  */
  oldWorldPath = function () {
    // this.contextHelper.setHopLearn(this.agentsCMP.hopLearn)
    // this.agentsCMP.setHopLearn()
  }

  /**
  * coordinate between AI and SafeFlow or other ai's
  * @method coordinationDML
  *
  */
  coordinationDML = async function (message) {
    // prepare proof of work and message to network peer
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
  * beebee learning patterns
  * @method beebeeFlow
  *
  */
  beebeeFlow = async function (inFlow) {
    // map life-strap story and further peer conversations and map to lifePatterns
    let lifeSnapPatterns = this.lifeLearn.lifeFlow(inFlow, 'life-strap-first')
    console.log('lifePattern operational')
    console.log(lifeSnapPatterns)
    // take quick look with beebee own bentoboxDS NLP skills
    let firstReview = await this.contextHelper.inputLanuage(inFlow.data.content, inFlow)
    // beebee has to decide on best info gathering paths.
    // check for tools use
    let toolUse = false
    if (inFlow.data.tools.length > 0) {
      toolUse = true
    }
    // start action based on tool
    let uploadTools = false
    if (toolUse === true) {
      for (let tool of inFlow.data.tools ) {
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


  }

  /**
   * Handle specific skill requests and route results to brain components
   * @method handleSkillRequest
   */
  handleSkillRequest = async function (message) {
    const { skill, params, bbid } = message;
    console.log(`[BbAI] Handling skill request: ${skill}`);
    
    let result;
    if (skill === 'rdf') {
      result = await this.skills.rdfNavigator.fetchDBpediaLayer(params.rdfUrl, params.subjectUri);
      
      // Route to resonAgent (Brain)
      console.log(`[BbAI] Routing RDF results to TrinityManager`);
      const agents = await this.brain.trinityManager.ignite({
        lexicon: result,
        biometrics: {},
        history: []
      });

      // Emit response back to network/UI
      this.emit('beebee-response', {
        type: 'bbai-reply',
        action: 'skill-complete',
        task: 'rdf-extraction',
        bbid: bbid,
        data: {
          skill: 'rdf',
          result: result,
          agents: Object.keys(agents)
        }
      });
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
    // assess all part of beebee reply and pass on streaming output back to bentoboxds
    this.on('beebee-pre-response', (token) => {
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
        // ...
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
    publicLibrary = await this.dataNetworkLive.BeeData.getPublicLibraryRefRange('datatype')
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





}

export default BbAI
