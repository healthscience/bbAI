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
import DataParse from './dataExtract/dataParse.js'
import ContextHelp from './timehelp/contextHelper.js'

class BbAI extends EventEmitter {

  constructor(holepunch) {
    super()
    this.hello = 'bb-AI--{{hello}}'
    this.holepunchLive = holepunch
    this.refContractsGen = {}
    this.queryBuilder = new HopQuerybuider()
    this.peerQ = ''
    this.contextHelper = new ContextHelp()
    /* this.timeHelper.on('data', (data) => {
      console.log(`Received data: "${data}"`)
    })
    this.timeHelper.write('bb hello') */
    this.dataParser = new DataParse()
  }

  /**
  * listener for Holepunch hypercore live and activve
  * @method libraryRefContracts
  *
  */
  listenHolepunchLive = function () {
    this.libraryRefContracts()
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
  * @method NLPflow
  *
  */
  nlpflow = function (inFlow) {
    console.log(inFlow)
    this.peerQ = inFlow
    // can beebee extract any data?  string input numbers array  file upload csv excel api etc.
    let initialDataExtract = this.dataParser.numberParse(inFlow)
    console.log('data extract')
    console.log(initialDataExtract)
    // pass to validtor FIRST TODO
    let bbResponseCategory = this.contextHelper.inputLanuage(this.peerQ)
    console.log('bb-response complete')
    console.log(bbResponseCategory)
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
      if (initialDataExtract.status !== true) {
        console.log('bb--no number')
        outFlow.data = bbResponseCategory.data
      } else {
        console.log('bb-numbers')
        // need to  assume question, data, compute and vis contracts need form if from NPL first time.
        initialDataExtract.action = 'genesis'
        let safeFlowQuery = this.queryBuilder.minModules(initialDataExtract, this.refContractsGen)
        console.log('bb-safe query build back-------')
        console.log(safeFlowQuery)
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