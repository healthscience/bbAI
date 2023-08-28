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
import DateCalculator from './dateCalculator.js'
import LibraryMatcher from './dateLanguage.js'

class ContextHelper extends EventEmitter {

  constructor() {
    super()
    this.baseDate = ''
    this.dateCalc = new DateCalculator()
    this.libraryMatch = new LibraryMatcher()
    this.words = []
    this.time = ''
    this.day = []
    this.month = []
    this.year = []
    this.timeDirection = 0
    this.context = []
    this.responseReply = {}
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
    console.log('input language query')
    console.log(inFlow)
    this.words = []
    this.context = []
    this.time = ''
    this.day = []
    this.month = []
    this.year = []
    this.timeDirection = 0
    this.responseReply = {}

    this.words = inFlow.split(" ")
    console.log(this.words)
    // words suggest past future?
    let replayOptions = ['hello', 'hopquery', 'sorry', 'prompt']
    // let responseType = replayOptions[0]
    this.extractContext()
    console.log('context')
    console.log(this.context)
    if (this.context === 'hello') {
      let response = {}
      response.probability = 1
      response.type = 'hello'
      response.text = 'hello how can beebee help?'
      response.data = 'hello how can beebee help?'
      return response
    } else if (this.context === 'query') {
      console.log('query forming HOP query suggestion')
      let queryData = this.queryManager()
      let response = {}
      response.probability = 1
      response.type = 'query'
      response.text = 'How does this query look?'
      response.data = queryData
      return response
    } else if (this.context === 'upload') {
      console.log('update data help file csvs Pandas AI agent help')
      let response = {}
      response.probability = 1
      response.type = 'upload'
      response.text = 'Please use the upload file button'
      response.data = {}
      return response
    } else if (this.context === 'knowledge') {
      console.log('question for knowledge science references etc.')
      let response = {}
      response.probability = 1
      response.type = 'knowledge'
      response.text = 'Heart rate is a measure of the blood flow and ...'
      response.data = {}
      return response
    } else if (this.context === 'help') {
      console.log('How to use bentobox-ds')
      let response = {}
      response.probability = 1
      response.type = 'help'
      response.text = 'The network library set governance over data standards of each bentoBoard.. .  . learn more'
      response.data = {}
      return response
    } else {
      this.libraryMatch.extractTimeDirection(this.words)
      this.libraryMatch.extractDates(this.words)
      let response = this.interpretate()
      return response
    }
  }

  /**
  * extract time day month year
  * @method extractContext
  *
  */
  extractContext = function () {
    // parse natural language
    // categorise general type of query
    let queryCategory = ['hello', 'query', 'upload', 'knowledge', 'help'] 
    let conversationWords = {}
    conversationWords['hello'] =  ['hello', 'How are you?']
    conversationWords['query'] =  ['query', 'chart', 'heart', 'rate', 'steps', 'bmi', 'compare']
    conversationWords['upload'] =  ['upload', 'file', 'add', 'data']
    conversationWords['knowledge'] =  ['why', 'can I', 'how', 'support', 'show me']
    conversationWords['help'] =  ['help', 'bentobox', 'feature', 'tools', 'chart', 'bentospace', 'boards', 'network', 'library', 'invite', 'machine', 'beebee']
    let contextScore = ''
    for (let vword of queryCategory) {
      for (let catW of conversationWords[vword]) {
        let matchWord = this.words.includes(catW)
        if(matchWord === true ) {
          contextScore = vword
        }
      }
    } 
    this.context = contextScore
  }

  
  /**
  * bring together all context building and suggested HOP query
  * @method queryManager
  *
  */
  queryManager = function () {
    let dataQuery = {}
    dataQuery.library = this.libraryMatch.probabiltyScoreMatch(this.words)
    let timeContext = {}
    timeContext.direction = this.libraryMatch.extractTimeDirection(this.words)
    timeContext.words = this.libraryMatch.extractDates(this.words)
    dataQuery.time = timeContext
    return dataQuery
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
    response.data = newDate //  depending on confidnce in query, maybe send second bast interpretation???
    return response
  }

  /**
  * return the calendar info.
  * @method calendarInfo
  *
  */
  calendarInfo = function () {
    // data info extracted
    let calendarInfo = {}
    calendarInfo.query = this.
    calendarInfo.words = this.words
    calendarInfo.time = this.time
    calendarInfo.day = this.day
    calendarInfo.month = this.month
    calendarInfo.year = this.year
    this.responseReply = calendarInfo
  }

  age () {
    let date = new Date()
    return date.getFullYear() - this.year
  }
}

export default ContextHelper