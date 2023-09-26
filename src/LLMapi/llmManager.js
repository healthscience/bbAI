'use strict'
/**
*  Manage interaction with LLM
*
*
* @class LlmManager
* @package    llm-manager
* @copyright  Copyright (c) 2023 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util, { callbackify } from 'util'
import EventEmitter from 'events'
import DataParse from './dataExtract/dataParse.js'
import CalendarHelper from './helpers/calendarHelper.js'
import SequenceBuilder from './dataExtract/sequencyBuilder.js'

class LlmManger extends EventEmitter {

  constructor() {
    super()
    this.dataParser = new DataParse()
    this.calendarContext = new CalendarHelper()
    this.sequenceManager = new SequenceBuilder()
  }

  /**
  * example write event
  * @method write
  *
  */
  write(data) {
    this.emit('data', data)
  }

  /**
  * ask LLM local and open-assistant
  * @method numberParse
  *
  */
  feedLLM = function (text) {
    let words = text.split(" ")
    let categoriseInput = this.extractContext(text)
    // example of number sequences
    let sequenceData = this.sequenceManager.sequenceFibonacci(words)
    // can beebee extract any data?  string input numbers array  file upload csv excel api etc.
    let initialDataExtract = []
    if (sequenceData.data.length > 0) {
      let buildResonse = { status: true, data: sequenceData.data, label: sequenceData.label }
      initialDataExtract = buildResonse
    } else {
      initialDataExtract = this.dataParser.numberParse(text)
    }
    let LLMcontext = {}
    LLMcontext.context = categoriseInput
    LLMcontext.sequence = initialDataExtract
    return LLMcontext
  }

  /**
  * extract time day month year
  * @method extractContext
  *
  */
  extractContext = function (words) {
    // parse natural language
    let context = {}
    // categorise general type of query
    let queryCategory = ['hello', 'query', 'upload', 'knowledge', 'help'] 
    let conversationWords = {}
    conversationWords['hello'] =  ['hello', 'How are you?']
    conversationWords['query'] =  ['query', 'chart', 'heart', 'rate', 'steps', 'bmi', 'compare', 'can', 'what', 'fibonacci']
    conversationWords['upload'] =  ['upload', 'file', 'add', 'data']
    conversationWords['knowledge'] =  ['why', 'can I', 'how', 'support', 'show me']
    conversationWords['help'] =  ['help', 'bentobox', 'feature', 'tools', 'bentospace', 'boards', 'network', 'library', 'invite', 'machine', 'beebee']
    let contextScore = ''
    for (let vword of queryCategory) {
      for (let catW of conversationWords[vword]) {
        let matchWord = words.includes(catW)
        if(matchWord === true ) {
          contextScore = vword
        }
      }
    }
    context.score = contextScore
    context.calendar = this.calendarContext.calendarManager()
    return context
  }


  /**
  * bring together all context building and suggested HOP query
  * @method soreManager
  *
  */
  scoreManager = function () {
  }

}

export default LlmManger
