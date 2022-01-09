const ws = new WebSocket('ws://localhost:5250')

ws.onopen = () => console.log('WebSocket opened')
ws.onclose = () => console.log('WebSocket closed')

ws.onmessage = resp => console.log(resp)