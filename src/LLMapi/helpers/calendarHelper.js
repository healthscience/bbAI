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
import util from 'util'
import EventEmitter from 'events'
import LibraryMatcher from './dateLanguage.js'
import DateCalculator from './dateCalculator.js'

class CalendarHelper extends EventEmitter {

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
  * bring together all context building and suggested HOP query
  * @method queryManager
  *
  */
  calendarManager = function () {
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

export default CalendarHelper