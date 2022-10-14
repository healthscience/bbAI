'use strict'
/**
*  perform data calculations
*
*
* @class CalculateDates
* @package    date-calculator
* @copyright  Copyright (c) 2022 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import EventEmitter from 'events'

class CalculateDates extends EventEmitter {

  constructor() {
    super()
  }

  /**
  * go back number days
  * @method backDays
  *
  */
  backDays(nowDate, dateRule) {
    let newDate = ''
    const myDate = nowDate
    if (dateRule[1] === -1) {
      const nextDayOfMonth = myDate.getDate() - 8
      myDate.setDate(nextDayOfMonth)
      newDate = myDate.toLocaleString()
    }
    return newDate
  }

}

export default CalculateDates