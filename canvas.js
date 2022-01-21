const cnvs = document.querySelector('#gamefield'),
      ctx = cnvs.getContext('2d'),
      cW = 500,
      cH = 500,
      uid = Math.random(),
      ws = new WebSocket('ws://localhost:5250')

ws.onopen = () => {
  ws.send(JSON.stringify({
    name: 'USER_INIT',
    user_name: 'Boda',
    user_id: uid
  }))

  const isRefresh = sessionStorage.getItem('isRefresh'),
        user_id = sessionStorage.getItem('user_id')

  if(isRefresh) {
    ws.send(JSON.stringify({
      name: 'CLIENT_DISCONNECT',
      user_id: user_id
    }))
    sessionStorage.setItem('user_id', uid)
  }
  else {
    sessionStorage.setItem('isRefresh', true)
    sessionStorage.setItem('user_id', uid)
  }
}

ws.onclose = () => alert('Соединение разорвано. Перезагрузите страницу')

cnvs.width = cW
cnvs.height = cH

const u_inpts = {
  name: 'USER_INPUT',
  user_id: uid,
  cursorCoords: {x: 0, y: 0},
  moveDir: {x: null, y: null},
  isLBM: false
}

document.addEventListener('mousemove', e => {
  u_inpts.cursorCoords.x = e.offsetX
  u_inpts.cursorCoords.y = e.offsetY
})

document.addEventListener('keydown', e => {
  if(e.key === 'd') u_inpts.moveDir.x = 1
  if(e.key === 's') u_inpts.moveDir.y = 1
  if(e.key === 'a') u_inpts.moveDir.x = -1
  if(e.key === 'w') u_inpts.moveDir.y = -1
})

document.addEventListener('keyup', e => {
  if(e.key === 'd') u_inpts.moveDir.x = null
  if(e.key === 's') u_inpts.moveDir.y = null
  if(e.key === 'a') u_inpts.moveDir.x = null
  if(e.key === 'w') u_inpts.moveDir.y = null
})

document.addEventListener('mousedown', e => {
  if(e.buttons === 1) u_inpts.isLBM = true
})

document.addEventListener('mouseup', e => {
  if(e.buttons === 0) u_inpts.isLBM = false 
})

ws.onmessage = resp => {
  const data = JSON.parse(resp.data)

  ctx.clearRect(0, 0, cW, cH)
  
  data.forEach(p => {

    ctx.beginPath()
    ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = p.color
    ctx.fill()

    ctx.strokeStyle = '#a0a0a0'
    ctx.lineWidth = 3
    ctx.stroke()

    // hp

    const d = p.size * 2

    ctx.beginPath()
    ctx.rect(p.pos.x - d, p.pos.y + d, d * 2 * p.hp / p.maxHP, p.size / 2)
    ctx.fillStyle = 'green'
    ctx.fill()

    ctx.beginPath()
    ctx.rect(p.pos.x + d, p.pos.y + d, -d * 2 * (1 - p.hp / p.maxHP), p.size / 2)
    ctx.fillStyle = 'red'
    ctx.fill()

    // name

    ctx.fillStyle = '#000'
    ctx.fillText(p.name, p.pos.x - p.name.length * 3.4, p.pos.y - d)

    // gun

    ctx.beginPath()
    ctx.fillStyle = '#000'
    ctx.arc(p.pos.x, p.pos.y, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.moveTo(p.pos.x, p.pos.y)
    ctx.lineTo(p.pos.x + Math.cos(degToRad(p.gunAngle)) * p.size * 2, p.pos.y + Math.sin(degToRad(p.gunAngle)) * p.size * 2)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 5
    ctx.stroke()

    p.bullets.forEach(b => {
      ctx.beginPath()
      ctx.arc(b.pos.x, b.pos.y, b.size, 0, Math.PI * 2)
      ctx.fillStyle = '#000'
      ctx.fill()
    })
  })
  
  // console.log(u_inpts)
  ws.send(JSON.stringify(u_inpts))
}

window.addEventListener('unload', () => {
  ws.send(JSON.stringify({
    name: 'CLIENT_DISCONNECT',
    user_id: uid
  }))
})