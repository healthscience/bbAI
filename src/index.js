'use strict'
/**
*  beebee Help Interface to BentoBox - AI
*
*
* @class BbAI
* @package    bbAI-interface
* @copyright  Copyright (c) 2022 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import EventEmitter from 'events'
import HopQuerybuider from 'hop-query-builder'
import ContextHelp from './context/contextHelper.js'
import HopLearn from 'hop-learn'
import HopDML from 'hop-dml'

class BbAI extends EventEmitter {

  constructor(xlibrary) {
    super()
    this.hello = 'bb-AI--{{hello}}'
    this.publicLibrary = {}
    this.nxtLibrary = xlibrary
    this.queryBuilder = new HopQuerybuider()
    this.hopLearn = {}
    this.hopDML = new HopDML(this.nxtLibrary)
    this.peerQ = ''
    this.contextHelper = new ContextHelp()
    this.gatherAI()
    this.listenAssessedResponse()
  }

  /**
  * listener for Holepunch hypercore live and activve
  * @method listenHolepunchLive
  *
  */
  listenHolepunchLive = async function () {
    this.publicLibrary = await this.libraryRefContracts()
  }

  /**
  * bring AI's to be
  * @method gatherAI
  *
  */
  gatherAI = function () {
    this.hopLearn = new HopLearn()
    this.listenHopLearn()
    this.contextHelper.setHopLearn(this.hopLearn)
    this.outflowEmbedding()
  }

  /**
  * coordinate between AI and SafeFlow or other ai's
  * @method beginAgents
  *
  */
  beginAgents = async function (task) {
    await this.hopLearn.openOrchestra(task)
  }


  /**
  * close an agent
  * @method closeAgents
  *
  */
  stopAgents = function (task) {
    this.hopLearn.closeOrchestra(task)
  }
  
  /**
  * coordinate between AI and SafeFlow or other ai's
  * @method coordinationAI
  *
  */
  coordinationAgents = async function (message) {
    // setup, data, compute, predict, evalute, repeat, automate ... .. 
    this.hopLearn.coordinateAgents(message)
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
  * listen to HOP-Learn
  * @method listenHopLearn
  *
  */
  listenHopLearn = function () {
    this.hopLearn.on('hop-learn', (data) => {
      // let beebee check for other info to combine or send back to peer via HOP
      if (data.action === 'cale-gpt4all') {
        this.emit('peer-bb-direct', data)
      } else if (data.action === 'hop-learn-feedback') {
        this.emit('peer-bb-direct', data)
      } else if (data.action === 'cale-evolution' || data.context?.task === 'cale-evolution') {
        this.emit('peer-bb-direct', data)
      } else if (data.context?.task === '') {
        let outFlow = {}
        outFlow.type = data.context.type
        outFlow.action = data.context.action
        outFlow.task = data.context.task
        outFlow.text = 'The model has completed training.  Run to update prediction.'
        outFlow.query = false
        outFlow.bbid = data.context.bbid
        outFlow.data = data
        this.emit('peer-bb-direct', outFlow)
      }
    })
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
    outFlow.text = 'a peer has send chart data'
    outFlow.query = false
    outFlow.bbid = data.hop.bbid
    this.emit('peer-bb-direct', outFlow)
  }

  /**
  * NLP conversation
  * @method nlpflow
  *
  */
  nlpflow = async function (inFlow) {
    console.log('BB--nlpflow')
    // console.log(inFlow)
    this.peerQ = inFlow.data.text
    // pass to validtor FIRST TODO
    // does this flow free text only or includes file data?
    let blindFileName
    let bbResponseCategory = {}
    if (inFlow.data?.filedata) {
      // save the data to hyperdrive
      blindFileName = 'blindt' + inFlow.bbid
      // temp. prepare the data into an array for y axis and x time
      let tempFilePrep = await this.blindFiledataPrep(inFlow.data.filedata, inFlow.data.content, inFlow.data.context)
      // if no data just inform of no data
      if (tempFilePrep.x.length > 0) {
        let fileAction = {}
        fileAction.probability = 1
        fileAction.type = 'hopquery'
        fileAction.text = 'Please chart the data in the file'
        let summarydata = {
          context: { score: 'query', calendar: '' },
          visstyle: [ 'line' ],
          sequence: { status: true, data: tempFilePrep.x, label: tempFilePrep.y }
        }
        fileAction.data = summarydata
        bbResponseCategory = fileAction
        await this.nxtLibrary.liveHolepunch.DriveFiles.hyperdriveJSONsaveBlind(blindFileName, JSON.stringify(bbResponseCategory.data.sequence))
        this.emit('assessed-response', bbResponseCategory, inFlow.bbid, blindFileName)
      } else {
        // no data return message to inform
        let outFlow = {}
        outFlow.type = 'query-no-data'
        outFlow.action = ''
        outFlow.text = 'a peer has send chart data'
        outFlow.query = false
        outFlow.bbid = inFlow.bbid
        this.emit('beebee-response', outFlow)
      }
    } else {
      // pass to HOP-Learn / LLM to see what it makes of the query?
      await this.contextHelper.inputLanuage(this.peerQ, inFlow)
    }
  }

  /**
  * listen for assessed response
  * @method listenAssessedResponse
  *
  */
  listenAssessedResponse = async function () {
    this.contextHelper.on('assessed-response', async (bbResponseCategory, bbox) => {
      // did the LLM provide numbers to chart, extract date information from questions etc.?
      // save to hyperdrive
      let blindFileName
      if (bbResponseCategory.type !== 'agent-response' && bbResponseCategory.type !== undefined && bbResponseCategory.type !== 'hello' && bbResponseCategory.type !== 'upload' && bbResponseCategory.type !== 'library' && bbResponseCategory.type !== 'library-open') {
        blindFileName = 'blindt' + bbox
        await this.nxtLibrary.liveHolepunch.DriveFiles.hyperdriveJSONsaveBlind(blindFileName, JSON.stringify(bbResponseCategory.data.sequence))
      }
      await this.outflowPrepare(bbResponseCategory, bbox, blindFileName)
    })
    // file upload
    this.on('assessed-response', async (bbResponseCategory, bbox, blindFileName) => {
      // did the LLM provide numbers to chart, extract date information from questions etc.?
      await this.outflowPrepare(bbResponseCategory, bbox, blindFileName)
    })
  }

  /**
  * format ready for return 
  * @method outflowPrepare
  *
  */
  outflowPrepare = async function (bbResponseCategory, bbox, blindFileName) {
    // need rules outFlow logic to order reponse and append data where relevant.
    console.log('bb--prepareoutFLow---')
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
        let hqbHolder = {}
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
        }
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
      // bbResponseCategory.action = 'start'
      // bbResponseCategory.text = bbResponseCategory.text
      // bbResponseCategory.origin = 'beebee'
      // use HQB for the library to build query and get data (leave 'higher' level for manage flows through HOP)
      // outFlow = await this.nxtLibrary.libManager.libraryManage(bbResponseCategory)
    } else if (bbResponseCategory.type === 'upload') {
      outFlow.type = 'upload'
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
  * notify embedding complete 
  * @method outflowEmbedding
  *
  */
  outflowEmbedding = function () {
    this.hopLearn.on('hop-learn-embedded', (data) => {
      let outFlow = {}
      outFlow.type = 'agent-response'
      outFlow.text = 'Data has been embedded.'
      outFlow.query = false
      outFlow.data = data
      this.emit('beebee-response', outFlow)
    })

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
  *  temp hack to read csv file
  * @method blindFiledataPrep
  *
  */
  blindFiledataPrep = async function (fileInfo, message, context) {
    // make parser structure
    let parseInfo = {}
    parseInfo = { content: message, info: { cnumber: 0 }, context: context, file: fileInfo }
    let parseData = {}
    if (fileInfo.type === 'csv') {
      parseData = this.nxtLibrary.liveHolepunch.DriveFiles.fileUtility.TEMPwebCSVparse(parseInfo)
    } else if (fileInfo.type === 'json') {
      parseData = await this.nxtLibrary.liveHolepunch.DriveFiles.fileUtility.TEMPwebJSONparse(parseInfo)
    } else if (fileInfo.type === 'sqlite') {
      parseData = await this.nxtLibrary.liveHolepunch.DriveFiles.blindDataSqlite(parseInfo)
    }
    let dataTimeseries = {}
    dataTimeseries.x = parseData.data // [6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6]
    dataTimeseries.y = parseData.label // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]
    return dataTimeseries
  }

}

export default BbAI