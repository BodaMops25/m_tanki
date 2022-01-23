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
    this.lifeTime = 60
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
}

module.exports = {MovingParticle, Player, Bullet}