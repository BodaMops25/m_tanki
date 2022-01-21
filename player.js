const core = require('./core.js'),
      degToRad = core.degToRad,
      radToDeg = core.radToDeg,
      vecAngle = core.vecAngle,
      gameData = require('./game.json')


class MovingParticle {
  constructor({
    pos = {x: 0, y: 0},
    color = '#000',
    size = 10,
    moveAngle = 0,
    speed = 0
  } = {}) {
    this.pos = pos
    this.color = color
    this.size = size
    this.moveAngle = moveAngle
    this.speed = speed
  }
  move() {
    this.pos.x += Math.cos(degToRad(this.moveAngle)) * this.speed
    this.pos.y += Math.sin(degToRad(this.moveAngle)) * this.speed
  }
  // display(canvasCtx) {
    // canvasCtx.beginPath()
    // canvasCtx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2)
    // canvasCtx.fillStyle = this.color
    // canvasCtx.fill()
  // }
}

class Bullet extends MovingParticle {
  constructor({
    pos = {x: 0, y: 0},
    color = '#000',
    size = 10,
    moveAngle = 0,
    speed = 0,
    damage = 5
  } = {}) {
    super({pos: pos, color: color, size: size, moveAngle: moveAngle, speed: speed})
    this.isDead = false
    this.damage = damage
  }
  move_bullet(players) {
    this.move()
    if(this.pos.x < -this.size) {
      this.pos.x = -this.size
      this.isDead = true
    }
    else if(gameData.cW + this.size < this.pos.x) {
      this.pos.x = gameData.cW + this.size
      this.isDead = true
    }

    if(this.pos.y < -this.size) {
      this.pos.y = -this.size
      this.isDead = true
    }
    else if(gameData.cH + this.size < this.pos.y) {
      this.pos.y = gameData.cH + this.size
      this.isDead = true
    }

    players.forEach((p, i, arr) => {
      if(((p.pos.x - this.pos.x)**2 + (p.pos.y - this.pos.y)**2)**.5 <= this.size + p.size) {
        this.isDead = true
        p.hp -= this.damage

        if(p.hp <= 0) {
          arr.splice(i, 1)
          // alert('you dead!')
        }
      }
    })
  }
}

class Player extends MovingParticle {
  constructor({
    id = parseInt(Math.random() * new Date()),
    name = 'Unknown player',
    hp = 100,
    maxHP = 100,
    pos = {x: 0, y: 0},
    color = '#000',
    maxSpeed = 5,
    size = 10,
    shootDelay = 200,
    canShoot = true,
    forces = {x: 0, y: 0}
  } = {}) {
    super({pos: pos, color: color, size: size})
    this.id = id
    this.name = name
    this.hp = hp
    this.maxHP = maxHP
    this.maxSpeed = maxSpeed
    this.moveDir = {x: null, y: null}
    this.forces = forces
    this.deltaForce = .25
    this.cursorCoords = {x: 0, y: 0}
    this.bullets = []
    this.canShoot = canShoot
    this.shootDelay = shootDelay
  }

  move() {
    if((this.forces.x === 0 && this.forces.y === 0) && (this.moveDir.x === null && this.moveDir.y === null)) return

    if(this.moveDir.x && Math.abs(this.forces.x) <= this.maxSpeed) this.forces.x += this.deltaForce * this.moveDir.x
    else if(this.forces.x !== 0) this.forces.x -= this.forces.x / Math.abs(this.forces.x) * this.deltaForce

    if(this.moveDir.y && Math.abs(this.forces.y) <= this.maxSpeed) this.forces.y += this.deltaForce * this.moveDir.y
    else if(this.forces.y !== 0) this.forces.y -= this.forces.y / Math.abs(this.forces.y) * this.deltaForce

    this.forces.x = +this.forces.x.toFixed(2)
    this.forces.y = +this.forces.y.toFixed(2)

    this.angle = vecAngle(this.forces.x, this.forces.y)
    this.speed = (this.forces.x**2 + this.forces.y**2)**.5
    // this.speed = Math.abs(this.forces.x) > Math.abs(this.forces.y) ? this.forces.x : this.forces.y

    this.pos.x += Math.cos(degToRad(this.angle)) * Math.abs(this.speed)
    this.pos.y += Math.sin(degToRad(this.angle)) * Math.abs(this.speed)

    if(this.pos.x < this.size) {
      this.pos.x = this.size
      this.forces.x = 0
    }
    else if(gameData.cW - this.size < this.pos.x) {
      this.pos.x = gameData.cW - this.size
      this.forces.x = 0
    }

    if(this.pos.y < this.size) {
      this.pos.y = this.size
      this.forces.y = 0
    }
    else if(gameData.cH - this.size < this.pos.y) {
      this.pos.y = gameData.cH - this.size
      this.forces.y = 0
    }
  }

  // setMovement() {
  //   document.addEventListener('keydown', e => {
  //     if(e.key === 'd') this.moveDir.x = 1
  //     if(e.key === 's') this.moveDir.y = 1
  //     if(e.key === 'a') this.moveDir.x = -1
  //     if(e.key === 'w') this.moveDir.y = -1
  //   })
    
  //   document.addEventListener('keyup', e => {
  //     if(e.key === 'd') this.moveDir.x = null
  //     if(e.key === 's') this.moveDir.y = null
  //     if(e.key === 'a') this.moveDir.x = null
  //     if(e.key === 'w') this.moveDir.y = null
  //   })
    
  //   document.addEventListener('mousemove', e => {
  //     this.cursorCoords.x = e.offsetX
  //     this.cursorCoords.y = e.offsetY
  //   })
    
  //   document.addEventListener('click', e => {
  //     this.shoot()
  //   })
  // }

  get gunAngle() {
    const eX = this.cursorCoords.x - this.pos.x,
          eY = this.cursorCoords.y - this.pos.y
          
    return vecAngle(eX, eY)
  }
  set gunAngle(deg) {
    this.cursorCoords.x = this.pos.x + Math.cos(degToRad(deg))
    this.cursorCoords.y = this.pos.y + Math.sin(degToRad(deg))
  }

  shoot() {
    if(this.canShoot) {
      const gunEndX = this.pos.x + Math.cos(degToRad(this.gunAngle)) * this.size * 2,
            gunEndY = this.pos.y + Math.sin(degToRad(this.gunAngle)) * this.size * 2

      this.bullets.push(new Bullet({size: 3, moveAngle: this.gunAngle, speed: 10, pos: {x: gunEndX, y: gunEndY}}))

      this.canShoot = false
      setTimeout(() => this.canShoot = true, this.shootDelay)
    }
  }

  // display_player(cnvsCtx) {
  //   this.display(cnvsCtx)

  //   cnvsCtx.strokeStyle = '#a0a0a0'
  //   cnvsCtx.lineWidth = 3
  //   cnvsCtx.stroke()

  //   // hp

  //   const d = this.size * 2

  //   cnvsCtx.beginPath()
  //   cnvsCtx.rect(this.pos.x - d, this.pos.y + d, d * 2 * this.hp / this.maxHP, this.size / 2)
  //   cnvsCtx.fillStyle = 'green'
  //   cnvsCtx.fill()

  //   cnvsCtx.beginPath()
  //   cnvsCtx.rect(this.pos.x + d, this.pos.y + d, -d * 2 * (1 - this.hp / this.maxHP), this.size / 2)
  //   cnvsCtx.fillStyle = 'red'
  //   cnvsCtx.fill()

  //   // name

  //   cnvsCtx.fillStyle = '#000'
  //   cnvsCtx.fillText(this.name, this.pos.x - this.name.length * 3.4, this.pos.y - d)

  //   // gun

  //   cnvsCtx.beginPath()
  //   cnvsCtx.fillStyle = '#000'
  //   cnvsCtx.arc(this.pos.x, this.pos.y, 2, 0, Math.PI * 2)
  //   cnvsCtx.fill()
  //   cnvsCtx.moveTo(this.pos.x, this.pos.y)
  //   cnvsCtx.lineTo(this.pos.x + Math.cos(degToRad(this.gunAngle)) * this.size * 2, this.pos.y + Math.sin(degToRad(this.gunAngle)) * this.size * 2)
  //   cnvsCtx.strokeStyle = '#000'
  //   cnvsCtx.lineWidth = 5
  //   cnvsCtx.stroke()
  // }
}

module.exports = {MovingParticle, Player, Bullet}