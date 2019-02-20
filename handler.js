const fetch = require('node-fetch')

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

  return {
    statusCode: 302,
    headers: {
      Location: `https:${fileLocation.replace(/\.webm$/, '.gif')}`
    }
  }
}
