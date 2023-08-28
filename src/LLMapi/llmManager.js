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

class LlmManger extends EventEmitter {

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

}

export default LlmManger
