'use strict'
/**
*  perform match to datatype reference contracts
*
*
* @class DatatypeMatcher
* @package    npl-matcher
* @copyright  Copyright (c) 2022 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import EventEmitter from 'events'

class DatatypeMatcher extends EventEmitter {

  constructor() {
    super()
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
  * return the datatype context
  * @method probabiltyScoreMatch
  *
  */
  probabiltyScoreMatch = function (extractWords) {
    let datatypeMatch = {}
    // input the peer network library datatype ref contracts and extrac wikipeida text via api call
    let libraryDatatypes = [{text: 'heart', board: '62d1f603909c650a27c5e956ce7ec7e089f7e6a5', mod: 'a1de4c9d6863169ff3d8f27dfef177899169c4d8'}, {text: 'steps', board: '62d1f603909c650a27c5e956ce7ec7e089f7e6a5', mod: 'a1de4c9d6863169ff3d8f27dfef177899169c4d8'}]
    for (let eWord of extractWords) {
      for (let libRef of libraryDatatypes) {
        if (eWord === libRef.text) {
          datatypeMatch = libRef
        }
      }
    }
    return datatypeMatch
  }

  /**
  * extract time day month year
  * @method extractTimeDirection
  *
  */
  extractTimeDirection = function (words) {
    // parse natural language
    let pastWords = ['last', 'past', 'yesterday', 'ago', 'remember', 'back']
    let pastScore = 0
    for (let pword of pastWords) {
      let matchWord = words.includes(pword)
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

    return pastScore  // postive future  negative past zero unsure
  }
  
  /**
  * extract time day month year
  * @method extractDates
  *
  */
  extractDates = function (words) {
    // parse natural language & return a utc date string(s)
    this.baseDate = new Date()
    let day = []
    let month = []
    // day language?
    let dayWords = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    let dayScore = ''
    for (let dword of dayWords) {
      let matchWord = words.includes(dword)
      if(matchWord === true ) {
        dayScore = dword
      }
    }
    
    day.push(dayScore)
    let monthWords = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December']
    let monthScore = ''
    for (let mword of monthWords) {
      let matchWord = words.includes(mword)
      if(matchWord === true ) {
        monthScore = mword
        month.push(monthScore)
      }
    }
    let dateScore = {}
    dateScore.day = day
    dateScore.month = month
    return dateScore
  }
}

export default DatatypeMatcher
