// const tournament_id = document.querySelector("#tour-id").innerHTML

async function handleWebSocketTournament(tournament_id) 
{
    const socket = new WebSocket(`ws://localhost:8002/ws/tournaments/${tournament_id}`);


    socket.onopen = (event) => {
        console.log('Socket opening', event);
    };

    socket.onmessage = (event) => {
        console.log(JSON.parse(event.data));
        return false;
    };

    socket.onclose = (event) => {
        console.log('Socket closed', event);
    };
}
// socket.send(JSON.stringify({
//     'name': 'Nuno',
//     'alias': 'Nuno67713'
// }));