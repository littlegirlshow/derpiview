const fetch = require('node-fetch')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

let serviceConstants = null

async function populateServiceConstants() {
  if(!serviceConstants) {
    const params = {
      Bucket: 'service-constants',
      Key: 'serviceConstants.json'
    }
    
    serviceConstants = await s3.getObject(params, (err) => {
      if (err) {
        throw err
      }
    }).promise().then((data) => JSON.parse(data.Body.toString()));
  }
}

module.exports.notify = async (event) => {
  await populateServiceConstants()
  
  await Promise.all(
    event.Records.map((record) => {
      if(record.eventName !== 'INSERT') return
      
      const postId = record.dynamodb.Keys.priPart.S.match(/^derpiLink\|(.*)$/)[1]
      
      return fetch(serviceConstants.notificationWebhook, {
        method: 'post',
        body: JSON.stringify({
          content: `Image posted in the room: https://derpibooru.org/${postId}`
        }),
        headers: { 'Content-Type': 'application/json' }
      })
    })
  )
}