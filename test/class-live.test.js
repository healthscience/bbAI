import assert from 'assert'
import bbLive from '../src/index.js'

describe('bring bee-bee to be', function () {
  it('hello BB test', function () {
    let bbAI = new bbLive()
    assert.equal(bbAI.hello, 'bb-AI--{{hello}}')
  })
})

describe('check input question arriving', function () {
  it('check for input language string & response route', function () {
    let bbAI = new bbLive()
    bbAI.nlpflow('hello')
    assert.equal(bbAI.peerQ, 'hello')
    let response = bbAI.nlpflow('hello')
    assert.equal(response.data, 'hello how can BB-AI help?')
  })

  it('check for input language string & response route', function () {
    let bbAI = new bbLive()
    bbAI.nlpflow('river flow tomorrow')
    assert.equal(bbAI.peerQ, 'river flow tomorrow')
    let response = bbAI.nlpflow('river flow tomorrow')
    assert.equal(response.text, 'Here is a query try')
  })
})