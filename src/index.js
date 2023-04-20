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
import TimeHelp from './timehelp/calendarHelper.js'

class BbAI extends EventEmitter {

  constructor() {
    super()
    this.hello = 'bb-AI--{{hello}}'
    this.peerQ = ''
    this.timeHelper = new TimeHelp()
    /* this.timeHelper.on('data', (data) => {
      console.log(`Received data: "${data}"`)
    })
    this.timeHelper.write('bb hello') */
  }

  /**
  * NLP conversation
  * @method NLPflow
  *
  */
  nlpflow = function (inFlow) {
    this.peerQ = inFlow
    // pass to validtor FIRST TODO
    let bbResponseCategory = this.timeHelper.inputLanuage(this.peerQ)
    let outFlow = {}
    outFlow.type = 'bbai'
    outFlow.action = 'npl-reply'
    if (bbResponseCategory.type === 'hello') {
      outFlow.type = 'hello'
      outFlow.text = 'hello how can BB-AI help?'
      outFlow.query = false
      outFlow.data = 'hello how can BB-AI help?'
    } else if (bbResponseCategory.type === 'hopquery') {
      outFlow.type = 'hopquery'
      outFlow.text = bbResponseCategory.text
      outFlow.query = true
      outFlow.data = bbResponseCategory.data
    } else if (bbResponseCategory.type === 'sorry') {
      outFlow.text = 'Sorry BB is unable to help.'
      outFlow.query = false
      outFlow.data = 'Sorry BB is unable to help.'
    } else if (bbResponseCategory.type === 'prompt') {
      outFlow.text = 'Could you state the day of the week/month, year etc?'
      outFlow.query = false
      outFlow.data = bbResponseCategory.data
    } else {
      outFlow.query = false
      outFlow.data = 'sorry BB cannot help.  BB is still learning.'
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
    outFlow.type = 'CALEAI'
    outFlow.action = 'prediction'
    let caleReply = '' // need to call AI
    if (caleReply === 'no-prediction') {
      outFlow.data = 'This is not operational yet, still testing' // call prediction flow
    }
    return outFlow
  }

}
export default BbAI