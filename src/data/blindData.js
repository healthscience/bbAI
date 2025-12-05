'use strict'
/**
*  manage file data in blind context
*
*
* @class BlindData
* @package    bbAI-interface
* @copyright  Copyright (c) 2025 James Littlejohn
* @license    http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
* @version    $Id$
*/
import util from 'util'
import EventEmitter from 'events'

class BlindData extends EventEmitter {

  constructor(dataStore) {
    super()
    this.nxtLibrary = dataStore
  }

  /**
   * file will be uploaded to Hyperdrive via holepunch-hop
   * @method fileDataFlow
  */
  filePreviewData = async function (fileInfo, bbid) {
    console.log('file data flows=======')
    console.log(fileInfo.data.upload)
    console.log(bbid) 
    // prepare interactive data table for peer to select what to chart
    let blindFileName
    let bbResponseCategory = {}
    // save the data to hyperdrive
    blindFileName = 'blindt' + bbid
    // temp. prepare the data into an array for y axis and x time
    let tempFilePrep = await this.blindFiledataPrep(fileInfo.data.upload.data.content.filedata, fileInfo.data.upload.data.content.filedata.grid, fileInfo.data.context)
    // if no data just inform of no data
    if (tempFilePrep.x.length > 0) {
      let fileAction = {}
      fileAction.probability = 1
      fileAction.type = 'hopquery'
      fileAction.text = 'Please chart the data in the file'
      let summarydata = {
        context: { score: 'query', calendar: '' },
        visstyle: [ 'line' ],
        sequence: { status: true, data: tempFilePrep.x, label: tempFilePrep.y },
        input: { data: { compute: 'observation'} }
      }
      fileAction.data = summarydata
      bbResponseCategory = fileAction
      await this.nxtLibrary.liveHolepunch.DriveFiles.hyperdriveJSONsaveBlind(blindFileName, JSON.stringify(bbResponseCategory.data.sequence))
      let dataBlind = {}
      dataBlind.type = 'blindfile-data'
      dataBlind.bbresp = bbResponseCategory
      dataBlind.bbid = bbid
      dataBlind.blindfile = blindFileName
      return dataBlind
    } else {
      // no data return message to inform
      let outFlow = {}
      outFlow.type = 'query-no-data'
      outFlow.action = ''
      outFlow.text = 'no data found'
      outFlow.query = false
      outFlow.bbid = bbid
      let dataBlind = {}
      dataBlind.type = 'blindfile-none'
      dataBlind.message = outFlow
      return dataBlind
    }
  }

  /**
  *  temp hack to read csv file
  * @method blindFiledataPrep
  *
  */
  blindFiledataPrep = async function (fileInfo, message, context) {
    console.log('blind data prep')
    console.log(fileInfo)
    console.log(message)
    console.log(context)
    // make parser structure
    let parseInfo = {}
    parseInfo = { content: message, info: { cnumber: 0 }, context: context, file: fileInfo }
    let parseData = {}
    if (fileInfo.type === 'csv') {
      parseData = this.nxtLibrary.liveHolepunch.DriveFiles.fileUtility.TEMPwebCSVparse(parseInfo)
    } else if (fileInfo.type === 'json') {
      parseData = await this.nxtLibrary.liveHolepunch.DriveFiles.fileUtility.TEMPwebJSONparse(parseInfo)
    } else if (fileInfo.type === 'sqlite') {
      parseData = await this.nxtLibrary.liveHolepunch.DriveFiles.blindDataSqlite(parseInfo)
    }
    let dataTimeseries = {}
    dataTimeseries.x = parseData.data // [6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6]
    dataTimeseries.y = parseData.label // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]
    return dataTimeseries
  }
}

export default BlindData