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
import util from 'util'
import EventEmitter from 'events'
import LocalNLP from '../LLMapi/nlpManager.js'
import LibraryMatcher from '../LLMapi/helpers/dateLanguage.js'
import DateCalculator from '../LLMapi/helpers/dateCalculator.js'
import { isAnyArrayBuffer } from 'util/types'

class ContextHelper extends EventEmitter {

  constructor() {
    super()
    this.hopLearn = {}
    this.baseDate = ''
    this.liveNLP = new LocalNLP()
    this.dateCalc = new DateCalculator()
    this.libraryMatch = new LibraryMatcher()
    this.responseReply = {}
    this.day = []
    this.responseHolder = {}
    this.responseLength = {}
  }

  /**
  * set hop learn in context
  * @method setHopLearn
  *
  */
  setHopLearn(hoplearn) {
    this.hopLearn = hoplearn
    this.listenHOPlearn()
  }

  /**
  * extract categories from input lanaguage flow
  * @method inputLanuage
  *
  */
  inputLanuage = async function (question, inFlow) {
    let chartCommand = false
    // if chart, upload, library  key words then limit NPL
    let firstWord = question.split(' ')[0]
    if (firstWord.toLowerCase() === 'chart') {
      chartCommand = true
    } else if (firstWord.toLowerCase() === 'hello') {
      chartCommand = true
    } else if (firstWord.toLowerCase() === 'upload') {
      chartCommand = true
    } else if (firstWord.toLowerCase() === 'library') {
      chartCommand = true
    }
    if (chartCommand === true) {
      this.responseLength[inFlow.bbid] = 1
      this.liveNLP.feedNLP(question, inFlow)
    } else { 
      // ask agents via HOP-Learn to suggest reply
      console.log(inFlow)
      this.responseLength[inFlow.bbid] = 2
      await this.hopLearn.coordinateAgents(inFlow)
      this.liveNLP.feedNLP(question, inFlow)
    }
  }

  /**
  * listen for agent responses
  * @method listenHOPlearn
  *
  */
  listenHOPlearn() {
    this.hopLearn.on('hop-learn-response', async (data) => {
      // has the holder been setup for an array
      if (!this.responseHolder[data.input.bbid]) {
        this.responseHolder[data.input.bbid] = []
        this.responseHolder[data.input.bbid].push(data)
      } else {
        this.responseHolder[data.input.bbid].push(data)
      }
      /*
      for (let cho of data.response.choices) {
        console.log(cho)
      } */
      this.assessResponses(data.input.bbid)
    })
    this.liveNLP.on('hop-manager-response', (data) => {
      if (!this.responseHolder[data.input.bbid]) {
        this.responseHolder[data.input.bbid] = []
        this.responseHolder[data.input.bbid].push(data)
      } else {
        this.responseHolder[data.input.bbid].push(data)
      }
      this.assessResponses(data.input.bbid)
    })

  }

  /**
  * extract categories from input lanaguage flow
  * @method assessResponses
  *
  */
  assessResponses = function (bbid) {
    let responseMade = {}
    if (this.responseLength[bbid] > 1) {
      let llmReply = false
      // need to loop over and find pairs of same input
      for (let input of this.responseHolder[bbid]) {
        llmReply = true
        // build keys
        if (input.response) {
          let extractLLMmessage = this.llmExtract(input.response.choices)
          let responWith = {}
          responWith.type = 'agent-text'
          responWith.data = extractLLMmessage
          responseMade = responWith
        } else {
          if (llmReply === false) {
            responseMade = input
          }
        }

      }

      // how to bring together LLM response and quick NLP
      let catResponse = this.formResponse(responseMade)
      this.emit('assessed-response', catResponse, bbid)
      // empty holder
      this.responseHolder[bbid] = []
    } else if (this.responseHolder[bbid].length === this.responseLength[bbid]) {
      let catResponse = this.formResponse(this.responseHolder[bbid][0])
      this.emit('assessed-response', catResponse, bbid)
      this.responseHolder[bbid] = []
    }
  }

  /**
  * given all the response from agents
  * @method llmExtract
  *
  */
  llmExtract = function (llMessage) {
    // let formattedText = {}
    let textExtract = llMessage[0].message.content
    // let splitText = 
    return textExtract
  }

  /**
  * given all the response from agents
  * @method formResponse
  *
  */
  formResponse = function (answerLLM) {
    // used returned LLM data to prepare response messages
    let response = {}
    if (answerLLM.type === 'agent-text') {
      response.probability = 1
      response.type = 'agent-response'
      response.text = answerLLM.data
      response.data = answerLLM
  }  else if (answerLLM?.context?.score === 'hello') {
      response.probability = 1
      response.type = 'hello'
      response.text = 'hello how can beebee help?'
      response.data = 'hello how can beebee help?'
    } else if (answerLLM?.context?.score === 'query') {
      response.probability = 1
      response.type = 'hopquery'
      response.text = 'How does this query look?'
      response.data = answerLLM
    } else if (answerLLM?.context?.score === 'upload') {
      response.probability = 1
      response.type = 'upload'
      response.text = 'Sorry, HOP has no data for that. Please upload or add url where beebee can find the data.'
      response.data = {}
    } else if (answerLLM?.context?.score === 'library') {
      response.probability = 1
      response.type = 'library-open'
      response.text = 'Open library'
      response.data = {}
    } else if (answerLLM?.context?.score === 'knowledge') {
      response.probability = 1
      response.type = 'knowledge'
      response.text = 'Heart rate is a measure of the blood flow and ...'
      response.data = {}
    } else if (answerLLM?.context?.score === 'help') {
      response.probability = 1
      response.type = 'help'
      response.text = 'The network library set governance over data standards of each bentoBoard.. .  . learn more'
      response.data = {}
    } else {
      let response = 'nothing to say' // this.interpretate()
    }
    return response
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