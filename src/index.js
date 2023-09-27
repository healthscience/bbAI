'use strict'
/**
*  Help Interface to BentoBox - AI
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

  constructor(holepunch) {
    super()
    this.hello = 'bb-AI--{{hello}}'
    this.holepunchLive = holepunch
    this.publicLibrary = {}
    this.queryBuilder = new HopQuerybuider()
    this.peerQ = ''
    this.contextHelper = new ContextHelp()
    /* this.timeHelper.on('data', (data) => {
      console.log(`Received data: "${data}"`)
    })
    this.timeHelper.write('bb hello') */
  }

  /**
  * listener for Holepunch hypercore live and activve
  * @method libraryRefContracts
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
    publicLibrary = await this.holepunchLive.BeeData.getPublicLibraryRange()
    return publicLibrary
  }

  /**
  * NLP conversation
  * @method queryInputs
  *
  */
  nlpflow = async function (inFlow) {
    console.log('beebee--nplflow')
    console.log(inFlow)
    this.peerQ = inFlow.data.text
    // pass to validtor FIRST TODO
    // pass to LLM to see what it makes of the query
    let bbResponseCategory = this.contextHelper.inputLanuage(this.peerQ)
    console.log('beebee back from LLM')
    console.log(bbResponseCategory)
    // did the LLM provide numbers to chart, extract date information from questions etc.?
    // save to hyperdrive
    let blindFileName = 'blindt' + inFlow.bbid
    await this.holepunchLive.DriveFiles.hyperdriveJSONsaveBlind(blindFileName, JSON.stringify(bbResponseCategory.data.sequence))
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
      console.log('bb--hopquery')
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
        console.log('intoHQB---------------')
        console.log(hqbHolder)
        let safeFlowQuery = this.queryBuilder.queryPath(hqbHolder, this.publicLibrary, blindFileName)
        outFlow.data = safeFlowQuery
      }
    } else if (bbResponseCategory.type === 'upload') {
      outFlow.type = 'upload'
      outFlow.text = bbResponseCategory.text
      outFlow.query = true
      outFlow.data = bbResponseCategory.data
    } else if (bbResponseCategory.type === 'knowledge') {
      outFlow.type = 'knowledge'
      outFlow.text = bbResponseCategory.text
      outFlow.query = true
      outFlow.data = bbResponseCategory.data
    } else if (bbResponseCategory.type === 'help') {
      outFlow.type = 'help'
      outFlow.text = bbResponseCategory.text
      outFlow.query = true
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
  * Ask other AI's
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

}
export default BbAI