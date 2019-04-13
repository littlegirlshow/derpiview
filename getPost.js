const fetch = require('node-fetch')
const dynamoose = require('dynamoose')

const Item = require('dynamoose').model(process.env.TABLE_NAME, {
  priPart: {
    type: String,
    hashKey: true
  },
  priSort: {
    type: String,
    rangeKey: true
  },
  data: {
    embedUrl: String,
    pageUrl: String
  }
}, {
  create: false,
  update: false,
  expires: {
    ttl: 21*24*60*60 // 3 weeks
  },
  useDocumentTypes: true,
  useNativeBooleans: true
})

module.exports.getPostDerpi = async (request) => {
  const { size, postId } = request.pathParameters
  if(!postId.match(/^[0-9]+$/)) {
    return {
      statusCode: 404,
      body: "Invalid post ID."
    }
  }
  
  const itemKey = {
    priPart: `derpiLink|${postId}`,
    priSort: '/derpiLink',
  }
  
  const post = await Item.get(itemKey)
  if(post) {
    return {
      statusCode: 302,
      headers: {
        Location: post.data.embedUrl
      }
    }
  }

  const derpiApiResponse = await fetch(`https://derpibooru.org/${postId}.json`).then((res) => res.json())

  const fileLocation = derpiApiResponse.representations[size]
  if(!fileLocation) {
    return {
      statusCode: 404,
      body: `Invalid representation size.`
    }
  }
  
  const embedUrl = `https:${fileLocation.replace(/\.webm$/, '.gif')}`
  const pageUrl = `https://derpibooru.org/${postId}`
  
  await (new Item({
      ...itemKey,
      data: {
        embedUrl,
        pageUrl
      }
  })).save()

  return {
    statusCode: 302,
    headers: { Location: embedUrl }
  }
}

module.exports.getPostBooru = async (request) => {
  const { booruDomain, postId } = request.pathParameters
  if(!postId.match(/^[0-9]+$/)) {
    return {
      statusCode: 404,
      body: "Invalid post ID."
    }
  }
  
  const itemKey = {
    priPart: `booruLink|${booruDomain}:${postId}`,
    priSort: '/booruLink',
  }
  
  const post = await Item.get(itemKey)
  if(post) {
    return {
      statusCode: 302,
      headers: {
        Location: post.data.embedUrl
      }
    }
  }

  const booruApiResponse = await fetch(`https://${booruDomain}/post/show.json?id=${postId}`, {
    headers: {
      'User-Agent': 'lgs-derpiview/1.0'
    }
  }).then((res) => res.json())

  const embedUrl = booruApiResponse.sample_url
  const pageUrl = `https://${booruDomain}/post/show/${postId}`
  
  await (new Item({
      ...itemKey,
      data: {
        embedUrl,
        pageUrl
      }
  })).save()

  return {
    statusCode: 302,
    headers: { Location: embedUrl }
  }
}