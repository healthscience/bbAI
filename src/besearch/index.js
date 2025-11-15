'use strict'
/**
*  besearch  manage cycle and oracle feedback
*
*
* @class BeSearch
* @package    bbAI-interface
* @copyright  Copyright (c) 2024 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import EventEmitter from 'events'

class BeSearch extends EventEmitter {

  constructor() {
    super()
    this.hello = 'besearchFlowCycles'
  }

  /**
  * listen for orcale feedbacks
  * @method listenOracles
  *
  */
  listenOracles = async function () {
    // what oracles are live, what feedback and priority, need to sort or take context from peers direct
    let oracleList = [{ spaceid: 123221, name: 'cueOne', oracle: 'let me show you . . .'}, { spaceid: 223221, name: 'cueTwo', oracle: 'take a look at'}]
    // use orchestration of agents to produce a list, always in flow, changing, fluid .. .. .
    this.emit('oracle', oracleList)
  }

}

export default BeSearch