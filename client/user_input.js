userData.inpts = {
  name: 'USER_INPUT',
  user_id: userData.id,
  cursorCoords: {x: 0, y: 0},
  moveDir: {x: null, y: null},
  isLBM: false
}

const u_inpts = userData.inpts

document.addEventListener('mousemove', e => {
  u_inpts.cursorCoords.x = e.offsetX
  u_inpts.cursorCoords.y = e.offsetY
})

document.addEventListener('keydown', e => {
  if(e.code === 'KeyD') u_inpts.moveDir.x = 1
  if(e.code === 'KeyS') u_inpts.moveDir.y = 1
  if(e.code === 'KeyA') u_inpts.moveDir.x = -1
  if(e.code === 'KeyW') u_inpts.moveDir.y = -1
})

document.addEventListener('keyup', e => {
  if(e.code === 'KeyD') u_inpts.moveDir.x = null
  if(e.code === 'KeyS') u_inpts.moveDir.y = null
  if(e.code === 'KeyA') u_inpts.moveDir.x = null
  if(e.code === 'KeyW') u_inpts.moveDir.y = null
})

document.addEventListener('mousedown', e => {
  if(e.buttons === 1) u_inpts.isLBM = true
})

document.addEventListener('mouseup', e => {
  if(e.buttons === 0) u_inpts.isLBM = false 
})