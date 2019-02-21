const fetch = require('node-fetch')
const dynamoose = require('dynamoose')

const Item = dynamoose.model(process.env.TABLE_NAME, {
  priPart: String,
  priSort: String
}, {
  create: false,
  update: false,
  expires: {
    ttl: 21*24*60*60 // 3 weeks
  }
})

module.exports.getPost = async (request) => {
  const postId = request.pathParameters.postId
  if(!postId.match(/^[0-9]+$/)) {
    return {
      statusCode: 404,
      body: "Invalid post ID."
    }
  }
  const propertyName = request.pathParameters.size

  const derpiApiResponse = await fetch(`https:\/\/derpibooru.org\/${postId}.json`).then((res) => res.json())

  const fileLocation = derpiApiResponse.representations[propertyName]
  if(!fileLocation) {
    return {
      statusCode: 404,
      body: `Invalid representation size.`
    }
  }
  
  await (new Item({
      priPart: `derpiLink|${postId}`,
      priSort: '/derpiLink'
  })).save()

  return {
    statusCode: 302,
    headers: {
      Location: `https:${fileLocation.replace(/\.webm$/, '.gif')}`
    }
  }
}