'use strict'
/**
*  extract compute statistic from text
*
*
* @class ComputeHelper
* @package    compute-helper
* @copyright  Copyright (c) 2025 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import EventEmitter from 'events'

class ComputeHelper extends EventEmitter {

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
  * visualise map to styles available
  * @method matchStyle
  *
  */
  matchComputeStatistics = function (words) {
    let libraryStats = ['observation', 'average', 'sum'] // this.liveLibraryVisRefs()
    // take text words and match to library descriptions
    let matchVwords = []
    for (let stat of libraryStats) {
      // does the question contain vis  word?
      let matchVword = words.filter(e => e === stat)

      if (matchVword.length > 0) {
        matchVwords.push({ compute: stat, match: true })
      }
    }
    // if no match make bar  default
    if (matchVwords.length === 0) {
      matchVwords.push({ stat: 'observation', match: true })
    }
    return matchVwords
  }

}

export default ComputeHelper