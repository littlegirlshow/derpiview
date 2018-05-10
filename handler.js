const https = require('https')

module.exports.hello = async (request) => {
  const postId = request.pathParameters.postId
  if(!postId.match(/^[0-9]+$/)) {
    return {
      statusCode: 404,
      body: "Invalid post ID."
    }
  }
  const propertyName = request.pathParameters.size

  const derpiApiResponse = await new Promise((resolve, reject) => https.get(`https:\/\/derpibooru.org\/${postId}.json`, resolve).on('error', reject))
    .then(response => new Promise(resolve => {
      var chunks = []
      response.on('data', data => {
        chunks.push(data)
      })

      response.on('end', () => resolve(Buffer.concat(chunks)))
    }))
    .then(JSON.parse)

  const fileLocation = derpiApiResponse.representations[propertyName]
  if(!fileLocation) {
    return {
      statusCode: 404,
      body: `Invalid representation size.`
    }
  }

  return {
    statusCode: 302,
    headers: {
      Location: `https:${fileLocation.replace(/\.webm$/, '.gif')}`
    }
  }
}
