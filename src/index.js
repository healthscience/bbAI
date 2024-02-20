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

class BbAI extends EventEmitter {

  constructor(xlibrary) {
    super()
    this.hello = 'bb-AI--{{hello}}'
    this.publicLibrary = {}
    this.nxtLibrary = xlibrary
    this.queryBuilder = new HopQuerybuider()
    this.peerQ = ''
    this.contextHelper = new ContextHelp()
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
    console.log('nplp')
    this.peerQ = inFlow.data.text
    // pass to validtor FIRST TODO
    // pass to LLM to see what it makes of the query
    let bbResponseCategory = this.contextHelper.inputLanuage(this.peerQ)
    // did the LLM provide numbers to chart, extract date information from questions etc.?
    // save to hyperdrive
    console.log('before hop cont')
    let blindFileName
    if (bbResponseCategory.type !== 'hello' && bbResponseCategory.type !== 'upload' && bbResponseCategory.type !== 'library') {
      blindFileName = 'blindt' + inFlow.bbid
      await this.nxtLibrary.liveHolepunch.DriveFiles.hyperdriveJSONsaveBlind(blindFileName, JSON.stringify(bbResponseCategory.data.sequence))
    }
    console.log('after hoplepuch call')
    // need rules outFlow logic to order reponse and append data where relevant.
    let outFlow = {}
    outFlow.type = 'bbai'
    outFlow.action = 'npl-reply'
    if (bbResponseCategory.type === 'hello') {
      outFlow.type = 'hello'
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
    } else if (bbResponseCategory.type === 'library') {
      console.log('beebee-ai--this.nxtLibrary')
      // console.log(this.nxtLibrary)
      bbResponseCategory.action = 'start'
      bbResponseCategory.text = bbResponseCategory.text
      bbResponseCategory.origin = 'beebee'
      // use HQB for the library to build query and get data (leave 'higher' level for manage flows through HOP)
      outFlow = await this.nxtLibrary.libManager.libraryManage(bbResponseCategory)
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
    return outFlow
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
    let languageContext = this.languageAgent(message.data.question)
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