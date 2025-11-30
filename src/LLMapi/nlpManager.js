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
import util from 'util'
import EventEmitter from 'events'
import DataParse from './dataExtract/dataParse.js'
import SequenceBuilder from './dataExtract/sequencyBuilder.js'
import CalendarHelper from './helpers/calendarHelper.js'
import StatsBuilder from './helpers/computeHelper.js'
import VisBuilder from './helpers/visHelper.js'

class LlmManger extends EventEmitter {

  constructor() {
    super()
    this.statContext = new StatsBuilder()
    this.visContext = new VisBuilder()
    this.calendarContext = new CalendarHelper()
    this.dataParser = new DataParse()
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
  * ask local NLP natural language processing 
  * @method feedNLP
  *
  */
  feedNLP = function (text, inFlow) {
    let words = text.toLowerCase().split(" ")
    // which category of question?
    let categoriseInput = this.extractContext(words)
    // any statstics terminology?
    let statisticsType = this.statContext.matchComputeStatistics(words)
    // type of chart or visualisation?
    let visStyle = this.visContext.matchStyle(words)
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
    LLMcontext.input = inFlow
    LLMcontext.context = categoriseInput
    LLMcontext.compute = statisticsType
    LLMcontext.visstyle = visStyle
    LLMcontext.sequence = initialDataExtract
    // this.emit('hop-manager-response', LLMcontext)
    return LLMcontext
  }

  /**
  * what type of question category is likey to be?
  * @method extractContext
  *
  */
  extractContext = function (words) {
    // parse natural language
    let context = {}
    // categorise general type of query
    let queryCategory = ['hello', 'query', 'upload', 'knowledge', 'library', 'help'] 
    let conversationWords = {}
    conversationWords['hello'] =  ['hello', 'How are you?']
    conversationWords['query'] =  ['query', 'chart', 'heart', 'rate', 'steps', 'bmi', 'compare', 'can', 'what', 'fibonacci']
    conversationWords['upload'] =  ['upload', 'file', 'add', 'data']
    conversationWords['knowledge'] =  ['why', 'can I', 'how', 'support', 'show me']
    conversationWords['library'] =  ['library', 'network', 'list', 'experiment', 'datatype', 'data', 'join', 'wearable', 'air', 'water']
    conversationWords['help'] =  ['help', 'bentobox', 'feature', 'tools', 'bentospace', 'boards', 'invite', 'machine', 'beebee']
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
