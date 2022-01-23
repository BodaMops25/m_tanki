const cnvs = document.querySelector('#gamefield'),
      ctx = cnvs.getContext('2d'),
      cW = 500,
      cH = 500

cnvs.width = cW
cnvs.height = cH

function display_player(playerData) {
  const p = playerData

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
}

function display_bullet(bulletData) {
  const b = bulletData

  ctx.beginPath()
  ctx.arc(b.pos.x, b.pos.y, b.size, 0, Math.PI * 2)
  ctx.fillStyle = '#000'
  ctx.fill()
}

function display(dataString) {
  const data = JSON.parse(dataString)

  ctx.clearRect(0, 0, cW, cH)
  
  data.forEach(p => {
    display_player(p)

    p.bullets.forEach(b => {
      display_bullet(b)
    })
  })
}