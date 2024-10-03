import { MyApp } from './MyApp.js';

var socket = new WebSocket(`ws://${window.location.hostname}:8002/ws/games/remote/queue`);
socket.onopen = (event) => {
    console.log('Socket opening', event);
};

socket.onmessage = (event) => {
	console.log(JSON.parse(event.data))
}

let app = new MyApp()
app.init()
app.render()