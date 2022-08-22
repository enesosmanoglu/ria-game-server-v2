import colors from 'colors/safe.js';
import { WebSocket, WebSocketServer } from 'ws';
import { setupHeartbeat, stopHeartbeat } from './lib/heartbeat.js';
import 'colors';
import positions from './positions.js';
import drawings from './drawings.js';

const wss = new WebSocketServer({
    port: 8080,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
    }
});

wss.on("listening", () => {
    console.log("Server started.")
})
wss.on('close', ws => {
    console.log('Server closed.');
});

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

wss.broadcast = function (data = {}, ...blacklist) {
    if (data instanceof Object)
        data = JSON.stringify(data)

    wss.clients.forEach(ws => {
        if (blacklist.includes(ws)) return;

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    });
};

wss.on('connection', (ws, request) => {
    ws.ip = request.headers.hasOwnProperty("x-forwarded-for") ? request.headers["x-forwarded-for"].split(',')[0] : "Localhost";
    ws.id = wss.getUniqueID();
    ws.log = (...args) => console.log(`(${new Date().toLocaleString()})`.bgBlack, (
        ws.readyState === WebSocket.OPEN ? colors.bgGreen :
            ws.readyState === WebSocket.CONNECTING ? colors.bgYellow :
                colors.bgRed
    )(` ${ws.id} `), ...args);
    ws.sendJSON = (data = {}) => ws.send(JSON.stringify(data));

    ws.log(ws.ip.gray, "     Connected".green, "| Total clients:", wss.clients.size);
    ws.on('close', () => {
        ws.log(ws.ip.gray, "  Disconnected".red, "| Total clients:", wss.clients.size);
        stopHeartbeat(ws);
        delete positions[ws.id];
        wss.broadcast({ t: 'disconnect', id: ws.id }, ws);
    });

    setupHeartbeat(ws);

    ws.on('message', msg => {
        let data = "";
        try {
            data = JSON.parse(msg.toString());
        } catch (error) {
            console.error('Invalid message came from Client', ws.id, '| Message:', msg.toString());
            return;
        }

        if (data.t == "pong") return;

        if (data.t == "position") {
            positions[ws.id] = { x: data.x, y: data.y };
            wss.broadcast({ ...data, id: ws.id }, ws);

            return;
        };

        if (data.t == "drawStart") {
            if (!drawings[ws.id])
                drawings[ws.id] = [];
            else
                drawings[ws.id] = drawings[ws.id].filter(a => a.length);
            drawings[ws.id].push([{ x: data.x, y: data.y }]);

            wss.broadcast({ ...data, id: ws.id }, ws);
            return;
        };
        if (data.t == "drawStop") {
            drawings[ws.id]?.first?.shift();
            wss.broadcast({ ...data, id: ws.id }, ws);
            return;
        };
        if (data.t == "draw") {
            let i = drawings[ws.id].length - 1;
            drawings[ws.id]?.last?.push({ x: data.x, y: data.y });
            if (data.d)
                setTimeout(() => {
                    drawings[ws.id][i]?.shift();
                }, data.d)
            console.log(drawings[ws.id])
            wss.broadcast({ ...data, id: ws.id }, ws);
            return;
        };

        ws.log(`[Message]`, data);

    });

    positions[ws.id] = { x: 0, y: 0 };
    wss.broadcast({ t: 'position', x: 0, y: 0, id: ws.id }, ws);
    ws.sendJSON({ t: 'info', id: ws.id, ip: ws.ip, ps: positions, ds: drawings })
});


export default wss;