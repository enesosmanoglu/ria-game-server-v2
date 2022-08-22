
import { WebSocket, WebSocketServer } from 'ws';
import 'colors';

/** @param {WebSocket} ws */
export function ping(ws) {
    ws.isAlive = false;
    ws.send(JSON.stringify({ t: "ping" }));
    ws.log("PING".cyan);
    setupTimeout(ws);
}

/** @param {WebSocket} ws */
export function onpong(ws) {
    ws.log("PONG".blue);
    ws.isAlive = true;
}


/** @param {WebSocket} ws */
export function setupHeartbeat(ws) {
    ws.on('message', msg => {
        let data = {};
        try {
            data = JSON.parse(msg.toString());
        } catch (error) {
            return;
        }

        if (data.t === 'pong')
            onpong(ws);

        setupTimeout(ws);
    });

    ping(ws);
}

/** @param {WebSocket} ws */
export function stopHeartbeat(ws) {
    clearTimeout(ws.heartbeatTimeout);
}

/** @param {WebSocket} ws */
function setupTimeout(ws) {
    stopHeartbeat(ws);
    ws.heartbeatTimeout = setTimeout(() => {
        if (ws.isAlive === false)// client did not respond the ping (pong)
            return ws.terminate();

        ping(ws);
    }, 30000);
}