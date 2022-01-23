document.querySelector('#chat-send-message-form').addEventListener('submit', e => {
  e.preventDefault()

  GameWebSocket.ws.send(JSON.stringify({
    name: 'USER_CHAT_MESSAGE',
    user_name: userData.name,
    message: document.querySelector('#message-value').value
  }))

  document.querySelector('#message-value').value = ''
})