import assert from 'assert'
import CalendarHelper from '../src/timehelp/calendarHelper.js'

describe('split input string into words', function () {
  it('check list of words split', function () {
    let calHelper = new CalendarHelper()
    calHelper.inputLanuage('last Thursday swimming heart rate')
    assert.strictEqual(calHelper.words.length, 5)
    assert.strictEqual(calHelper.timeDirection, -1)
    assert.strictEqual(calHelper.day[0], 'Thursday')
    assert.strictEqual(calHelper.month[0], '')
    assert.strictEqual(calHelper.context[0], '')
  })
})
