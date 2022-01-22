// STATIC SERVER

const http = require('http'),
      PORT = process.env.PORT || 8080,
      fs = require('fs').promises

const server = http.createServer((req, res) => {

  if(req.method === 'GET') {

    if(req.url === '/') req.url = '/game.html'

    fs.readFile(__dirname + req.url)
    .then(content => {

      let contentType = ''

      switch(req.url.match(/\..+$/)[0]) {
        case '.js':
          contentType = 'text/javascript'
          break
        case '.css':
          contentType = 'text/css'
          break
        case '.html':
          contentType = 'text/html' 
          break
      }

      res.writeHead(200, {'Content-Type': contentType})
      res.write(content)
      res.end()
    })
    .catch(err => {
      res.writeHead(404, {'Content-Type': 'text/html'})
      res.write('<meta charset="utf-8">')
      res.write('<h1><strong>404</strong> error, page not found<h1>')
      res.write(`<pre>${err}}</pre>`)
      res.end()
    })
  }
  else if(req.method === 'POST') {
    res.writeHead(405, {'Content-Type': 'text/html'})
    res.write('<meta charset="utf-8">')
    res.write('<h1><strong>405</strong> error, method not allowed<h1>')
    res.end()
  }
  
}).listen(PORT)

// SERVER

const ws = require('ws'),
      wss = new ws.Server({server})

const plyr = require('./player.js'),
      gameData = require('./game.json')

let u_in_resp = {}

function respondToClient() {
  return JSON.stringify(players.map(p => {
    return {
      id: p.id,
      name: p.name,
      maxHP: p.maxHP,
      hp: p.hp,
      pos: p.pos,
      gunAngle: p.gunAngle,
      color: p.color,
      size: p.size,
      bullets: p.bullets.map(b => ({pos: b.pos, size: b.size}))
    }
  }))
}

// GAME

const players = []

const getUpdate = setInterval(() => {
  players.forEach(p => {

    const {color, size, gunAngle, bullets,  pos: {x, y}} = p

    if(u_in_resp[p.id]) {
      p.moveDir = u_in_resp[p.id].moveDir
      p.cursorCoords = u_in_resp[p.id].cursorCoords
      if(u_in_resp[p.id].isLBM) p.shoot()
    }
    
    p.move()
    if(bullets.length) bullets.forEach((b, i, arr) => {
      if(b.isDead) {
        if(arr[i]) arr.splice(i, 1)
        return
      }
      b.move_bullet(players)
    })
  })  

  wss.clients.forEach(client => {
    if(client.readyState === ws.WebSocket.OPEN) client.send(respondToClient())
  })

}, 1000 / gameData.gameFPS)

// SERVER

wss.on('connection', webs => {

  webs.on('message', msg => {
    msg = JSON.parse(msg.toString())

    // console.log(msg.name)

    if(msg.name === 'USER_INIT') players.push(new plyr.Player({id: msg.user_id, name: msg.user_name, color: '#0ed', pos: {x: gameData.cW / 2, y: gameData.cH / 2}}))
    else if(msg.name === 'USER_INPUT') u_in_resp[msg.user_id] = msg
    else if(msg.name === 'CLIENT_DISCONNECT') {

      webs.addEventListener('close', () => {
        // console.log(msg.name)
        
        players.splice(players.findIndex(p => +p.id === +msg.user_id), 1)
      }, {once: 1})
    }
  })

})

// console.log('ws server running')