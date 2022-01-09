const ws = require('ws'),
      server = ws.Server({port: 5250})

server.on('connection', webs => {
  console.log('user connected')

  webs.on('message', msg => {

    server.clients.forEach(client => {
      if(client.readyState === WebSocket.OPEN) client.send(msg.toString())
    })
  })
})