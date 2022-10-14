'use strict'
/**
*  build calendar dates for HOP
*
*
* @class CalendarHelper
* @package    calendar-helper
* @copyright  Copyright (c) 2022 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util, { callbackify } from 'util'
import EventEmitter from 'events'
import DateCalculator from './dateCalculator.js'

class CalendarHelper extends EventEmitter {

  constructor() {
    super()
    this.baseDate = ''
    this.dateCalc = new DateCalculator()
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
  inputLanuage (inFLow) {
    this.words = inFLow.split(" ")
    // words suggest past future?
    let replayOptions = ['hello', 'hopquery', 'sorry', 'prompt']
    // let responseType = replayOptions[0]
    this.extractContext()
    if (this.context[0] === 'hello') {
      let response = {}
      response.probability = 1
      response.type = 'hello'
      response.text = 'hello how can BB-AI help?'
      response.data = 'hello how can BB-AI help?'
      return response
    } else {
      this.extractTimeDirection()
      this.extractDates()
      let response = this.interpretate()
      return response
    }
  }

  /**
  * extract time day month year
  * @method extractTimeDirection
  *
  */
  extractTimeDirection = function () {
    // parse natural language
    let pastWords = ['last', 'past', 'yesterday', 'ago', 'remember', 'back']
    let pastScore = 0
    for (let pword of pastWords) {
      let matchWord = this.words.includes(pword)
      if(matchWord === true ) {
        pastScore--
      }
    }

     /* const manFilter = (e, words, rules) => {
       let pastScore = 0
       // if includes a false then needs removing
       // let keepTidy = words.includes(false)
       return pastScore
     }
    const newfullData = this.words.filter(n => manFilter(n, this.words, this.pastWords)) */

    this.timeDirection = pastScore  // postive future  negative past zero unsure
  }

  /**
  * extract time day month year
  * @method extractContext
  *
  */
  extractContext = function () {
    // parse natural language
    let conversationWords = ['hello', 'How are you?']
    let contextScore = ''
    for (let vword of conversationWords) {
      let matchWord = this.words.includes(vword)
      if(matchWord === true ) {
        contextScore = vword
      }
    } 
    if (contextScore === 'hello') {
      this.context.push(contextScore)
    } else {
      let contextWords = ['week', 'every', 'mulltiple', 'list']
      for (let cword of contextWords) {
        let matchWord = this.words.includes(cword)
        if(matchWord === true ) {
          contextScore = cword
        }
      } 
      this.context.push(contextScore)  // postive future  negative past zero unsure
    }
  }
  
  /**
  * extract time day month year
  * @method extractDates
  *
  */
  extractDates = function () {
    // parse natural language & return a utc date string(s)
    this.baseDate = new Date()
    // day language?
    let dayWords = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    let dayScore = ''
    for (let dword of dayWords) {
      let matchWord = this.words.includes(dword)
      if(matchWord === true ) {
        dayScore = dword
      }
    }
    this.day.push(dayScore)
    let monthWords = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December']
    let monthScore = ''
    for (let mword of monthWords) {
      let matchWord = this.words.includes(mword)
      if(matchWord === true ) {
        monthScore = mword
      }
    }
    this.month.push(monthScore)
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
    let newDate = this.dateCalc.backDays(this.baseDate, dateRules)
    // build HOP query from logic and base time
    response.probability = 0.51
    response.type = 'hopquery'
    response.text = 'Here is a query try'
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

export default CalendarHelper