window.userData = {}
window.GameWebSocket = {}

document.querySelector('#sing-in-form').addEventListener('submit', e => {
  e.preventDefault()
  
  userData.id = (Math.random() * new Date()).toFixed()
  userData.name = document.querySelector('#user-name').value

  GameWebSocket.HOST = location.origin.replace(/^http/, 'ws')
  GameWebSocket.ws = new WebSocket(GameWebSocket.HOST)

  const ws = GameWebSocket.ws
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      name: 'USER_INIT',
      user_name: userData.name,
      user_id: userData.id
    }))
  }

  ws.onmessage = resp => {
    const data = JSON.parse(resp.data)

    if(data.name === 'USERS_CANVAS') {

      display(data.data)
      userData.inpts.user_id = userData.id
      ws.send(JSON.stringify(userData.inpts))
    }
    else if(data.name === 'USER_CHAT_MESSAGE') {
      const chatCnt = document.querySelector('.chat-container')

      chatCnt.insertAdjacentHTML('beforeend', `<p class="message my-msg"><span class="chat-name">${data.user_name}:</span> ${data.message}</p>`)
      chatCnt.scrollTo(0, chatCnt.scrollTopMax)
    }
  }

  ws.onclose = () => alert('Соединение разорвано. Перезагрузите страницу')

  document.querySelector('.sing-in-window').style.display = 'none'
  document.querySelector('.chat-window').classList.add('w-shown')

  window.onbeforeunload = () => {
    console.log('попытка перезагрузить страницу')
    return false
  }
})

window.addEventListener('unload', () => {
  GameWebSocket.ws.send(JSON.stringify({
    name: 'CLIENT_DISCONNECT',
    user_id: userData.id
  }))
})