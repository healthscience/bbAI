'use strict'
/**
*  Coordinate other agents
*
*
* @class AgentHelper
* @package    agent-helper
* @copyright  Copyright (c) 2025 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import EventEmitter from 'events'
import HopLearn from 'hop-learn'
// two CMP  iinc health for medical open source LLM,  Perplexity for products (try find open source), open source Mistral and others that fit open source use non llm techniques, allen inst. Sutton

class AgentHelper extends EventEmitter {

  constructor() {
    super()
    this.hopLearn = new HopLearn()
  }

  /**
  * set hop learn in context
  * @method setHopLearn
  *
  */
  setHopLearn() {
    // this.listenHOPlearn()
    this.outflowEmbedding()
  }

  /**
  * listen to HOP-Learn
  * @method listenHopLearn
  *
  */
  listenHopLearn = function () {
    this.hopLearn.on('hop-learn', (data) => {
      // let beebee check for other info to combine or send back to peer via HOP
      if (data.action === 'cale-gpt4all') {
        this.emit('peer-bb-direct', data)
      } else if (data.action === 'hop-learn-feedback') {
        this.emit('peer-bb-direct', data)
      } else if (data.action === 'cale-evolution' || data.context?.task === 'cale-evolution') {
        this.emit('peer-bb-direct', data)
      } else if (data.context?.task === '') {
        let outFlow = {}
        outFlow.type = data.context.type
        outFlow.action = data.context.action
        outFlow.task = data.context.task
        outFlow.text = 'The model has completed training.  Run to update prediction.'
        outFlow.query = false
        outFlow.bbid = data.context.bbid
        outFlow.data = data
        this.emit('peer-bb-direct', outFlow)
      }
    })

    this.hopLearn.on('hop-learn-models', (data) => {
      let outFlow = {}
      outFlow.type = data.type
      outFlow.action = data.action
      outFlow.task = data.task
      outFlow.text = 'The LLM models avaiable'
      outFlow.query = false
      outFlow.bbid = ''
      outFlow.data = data.data
      this.emit('peer-bb-models', outFlow)
    })
  }

  /**
  * notify embedding complete 
  * @method outflowEmbedding
  *
  */
  outflowEmbedding = function () {
    this.hopLearn.on('hop-learn-embedded', (data) => {
      let outFlow = {}
      outFlow.type = 'agent-response'
      outFlow.text = 'Data has been embedded.'
      outFlow.query = false
      outFlow.data = data
      this.emit('beebee-response', outFlow)
    })
  }

  /**
  * coordinate between AI and SafeFlow or other ai's
  * @method beginAgents
  *
  */
  beginAgents = async function (task) {
    await this.hopLearn.openAgent(task)
  }

  /**
  * close an agent
  * @method closeAgents
  *
  */
  stopAgents = function (task) {
    this.hopLearn.closeOrchestra(task)
  }
  
  /**
  * coordinate between AI and SafeFlow or other ai's
  * @method coordinationAI
  *
  */
  coordinationAgents = async function (message) {
    // setup, data, compute, predict, evalute, repeat, automate ... .. 
    this.hopLearn.coordinateAgents(message)
  }

}

export default AgentHelper