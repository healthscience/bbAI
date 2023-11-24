'use strict'
/**
*  Take language data inputs and categories -> LLM esq.
*
*
* @class ContextHelper
* @package    context-helper
* @copyright  Copyright (c) 2023 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util, { callbackify } from 'util'
import EventEmitter from 'events'
import LocalLLM from '../LLMapi/llmManager.js'
import LibraryMatcher from '../LLMapi/helpers/dateLanguage.js'
import DateCalculator from '../LLMapi/helpers/dateCalculator.js'

class ContextHelper extends EventEmitter {

  constructor() {
    super()
    this.baseDate = ''
    this.liveLLM = new LocalLLM()
    this.dateCalc = new DateCalculator()
    this.libraryMatch = new LibraryMatcher()
    this.responseReply = {}
    this.day = []
  }

  /**
  * example listener es6
  * @method write
  *
  */
  write(data) {
    this.emit('data', data)
  }

  /**
  * extract categories from input lanaguage flow
  * @method inputLanuage
  *
  */
  inputLanuage = function (inFlow) {
    this.responseReply = {}
    // see what the LLM makes of the query
    let answerLLM = this.liveLLM.feedLLM(inFlow)
    // console.log('what has LLM brought back')
    // console.log(answerLLM)
    // words suggest past future?
    // let replyOptions = ['hello', 'hopquery', 'sorry', 'prompt']
    // let responseType = replayOptions[0]
    // this.extractContext()
    // used returned LLM data to prepare response messages
    if (answerLLM.context.score === 'hello') {
      let response = {}
      response.probability = 1
      response.type = 'hello'
      response.text = 'hello how can beebee help?'
      response.data = 'hello how can beebee help?'
      return response
    } else if (answerLLM.context.score === 'query') {
      console.log('LLM--query suggested')
      let response = {}
      response.probability = 1
      response.type = 'hopquery'
      response.text = 'How does this query look?'
      response.data = answerLLM
      return response
    } else if (answerLLM.context.score === 'upload') {
      console.log('update data help file csvs Pandas AI agent help')
      let response = {}
      response.probability = 1
      response.type = 'upload'
      response.text = 'Sorry, HOP has no data for that. Please upload or add url where beebee can find the data.'
      response.data = {}
      return response
    } else if (answerLLM.context.score === 'library') {
      console.log('Library question/query')
      let response = {}
      response.probability = 1
      response.type = 'library'
      response.text = 'Querying library for you.'
      response.data = {}
      return response
    } else if (answerLLM.context.score === 'knowledge') {
      console.log('question for knowledge science references etc.')
      let response = {}
      response.probability = 1
      response.type = 'knowledge'
      response.text = 'Heart rate is a measure of the blood flow and ...'
      response.data = {}
      return response
    } else if (answerLLM.context.score === 'help') {
      console.log('How to use bentobox-ds')
      let response = {}
      response.probability = 1
      response.type = 'help'
      response.text = 'The network library set governance over data standards of each bentoBoard.. .  . learn more'
      response.data = {}
      return response
    } else {
      let response = 'nothing to say' // this.interpretate()
      return response
    }
  }


  /**
  * take in all assessment and build query
  * @method interpretate
  *
  */
  interpretate = function () {
    let response = {}
    // sort of logic tree or reules of interpretation
    let dateRules = []
    if (this.day.length === 1) {
      // only one day select
      dateRules.push(1)
    } else {
      dateRules.push(7)
    }
    if (this.timeDirection > 0) {
      dateRules.push(1)
    } else {
      dateRules.push(-1)
    }
    if (this.context === 'singular') {
      dateRules.push(1)
    } else {
      dateRules.push(5)
    }
    let newDate = 'nothing' // this.dateCalc.backDays(this.baseDate, dateRules)
    // build HOP query from logic and base time
    response.probability = 0.51
    response.type = 'hopquery'
    response.text = 'Here is a query '
    response.data = newDate //  depending on confidnce in query, maybe send second best interpretation???
    response.llm = 'llm-nothing'
    return response
  }

}

export default ContextHelper