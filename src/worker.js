addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 处理CORS预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  // 获取查询参数
  const url = new URL(request.url)
  const data = url.searchParams.get('data')
  
  if (!data) {
    return new Response('Missing data parameter', { status: 400 })
  }

  // 构建请求体
  const requestBody = {
    bot_id: "7464136676534140979",
    user_id: "123456789",
    stream: true,
    auto_save_history: true,
    additional_messages: [
      {
        role: "user",
        content: data,
        content_type: "text"
      }
    ]
  }

  // 调用Coze API
  const response = await fetch('https://api.coze.cn/v3/chat', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer pat_D3mAfLCSU9VWBqKYiYMCqOvQHeyc2z3rsqrSaUIqDM0bI5IgacSA21y9FCQTB3Lp',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  })

  // 设置CORS头部
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  }

  // 创建TransformStream来处理流式响应
  const { readable, writable } = new TransformStream()
  response.body.pipeTo(writable)

  return new Response(readable, { headers })
}
