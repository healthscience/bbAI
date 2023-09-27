'use strict'
/**
*  extract vis style 
*
*
* @class VisHelper
* @package    visualise-helper
* @copyright  Copyright (c) 2023 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import EventEmitter from 'events'
import { match } from 'assert'

class VisHelper extends EventEmitter {

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
  matchStyle = function (words) {
    let libraryVis = ['bar', 'line'] // this.liveLibraryVisRefs()
    // take text words and match to library descriptions
    let matchVwords = []
    for (let vis of libraryVis) {
      // does the question contain vis  word?
      let matchVword = words.filter(e => e === vis)

      if (matchVword.length > 0) {
        matchVwords.push({ vis: vis, match: true })
      }
    }
    // if no match make bar  default
    if (matchVwords.length === 0) {
      matchVwords.push({ vis: 'bar', match: true })
    }
    return matchVwords
  }

}

export default VisHelper