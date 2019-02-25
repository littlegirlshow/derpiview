const fetch = require('node-fetch')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

const serviceConstants = s3.getObject({
  Bucket: 'service-constants',
  Key: 'serviceConstants.json'
}).promise().then((data) => JSON.parse(data.Body.toString()))

module.exports.notify = async (event) => Promise.all(
  event.Records.map(async (record) => {
    if(record.eventName !== 'INSERT') return
    
    const keys = record.dynamodb.Keys
    
    if(!(keys.priPart.S.startsWith('derpiLink|') || keys.priPart.S.startsWith('booruLink|'))) return
    
    const pageUrl = record.dynamodb.NewImage.data.M.pageUrl.S
    
    return fetch((await serviceConstants).notificationWebhook, {
      method: 'post',
      body: JSON.stringify({
        content: `Image posted in the room: ${pageUrl}`
      }),
      headers: { 'Content-Type': 'application/json' }
    })
  })
)