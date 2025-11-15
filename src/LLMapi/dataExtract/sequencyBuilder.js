'use strict'
/**
*  Helpers for generater sequences
*
*
* @class sequenceBuilder
* @package    llm-manager
* @copyright  Copyright (c) 2023 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import EventEmitter from 'events'

class sequenceBuilder extends EventEmitter {

  constructor() {
    super()
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
  * use maths to build number sequences
  * @method sequenceFibonacci
  *
  */
  sequenceFibonacci = function (words) {
    let numberText = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
    let fib = false
    let digitsFound = []
    for (let word of words) {
      if (word === 'fibonacci') {
        fib = true
      }
      // any numbers in text
      let extractDigit = numberText.filter(e => e === word)
      if (extractDigit[0] !== undefined) {
        digitsFound.push(extractDigit[0])
      }
    }
    // pass on to number sequence function
    let sequence = this.sequenceBuilder(fib, digitsFound[0])
    return sequence
  }

  /**
  * maths for sequences
  * @method sequenceBuilder
  *
  */
  sequenceBuilder = function (fib, digit) {
    let fibonacci = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233]
    let singleNumber = 0
    let numbersText = {
      'zero': 0,
      'one': 1,
      'two': 2,
      'three': 3,
      'four': 4,
      'five': 5,
      'six': 6,
      'seven': 7,
      'eight': 8,
      'nine': 9,
      'ten': 10,
      'eleven': 11,
      'twelve': 12
    }
    if (fib === true) {
      singleNumber = numbersText[digit]
    }
    let sequenceData = fibonacci.slice(0, singleNumber)
    let sequenceLabel = this.formLabel(sequenceData)
    let sequenceHolder = {}
    sequenceHolder.data = sequenceData
    sequenceHolder.label = sequenceLabel
    return sequenceHolder
  }

  /**
  * take number array and provide number arry by count
  * @method formLabel
  *
  */
  formLabel = function (numArr) {
    let label = []
    let count = 1
    for (let item of numArr) {
      label.push(count.toString())
      count++
    }
    return label
  }

}

export default sequenceBuilder