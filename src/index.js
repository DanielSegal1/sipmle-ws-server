const WebSocket = require('ws');
const http = require('http');
const url = require('url');

const delay = (ms) => (
    new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
);

const server = http.createServer((req, res) => {
  if (req.url === '/number') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('2\n');
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server\n');
  }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    console.log('Client connected');
    const queryParams = url.parse(req.url, true).query;
    const {stage} = queryParams;

    try {
        const parsedStage = Number(stage ?? 1);

        if (![1, 2, 3, 4, 5].includes(parsedStage)) {
            throw new Error();
        }

        ws.stage = parsedStage;
    }
    catch (err) {
        console.log(err);
        ws.close(4666, 'query param stage should be 1 | 2 | 3 | 4 | 5');
    }

    ws.on('message', async (message) => {
        try {
            const parsedMessage = JSON.parse(message);

            if (parsedMessage.type === 'SUBSCRIBE') {
                if (ws.stage >= 5) {
                    await delay(Math.random() * (2000));
                }

                console.log('subscribed');
                ws.isSubscribed = true;
            }
            else if (parsedMessage.type === 'UNSUBSCRIBE') {
                ws.isSubscribed = false;
            }
            else {
                throw new Error();
            }
        }
        catch (err) {
            ws.close(4666, 'expected format: JSON with field \'type\' and values: SUBSCRIBE | UNSUBSCRIBE');
        }
    });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const sendRandomNumber = () => {
    wss.clients.forEach((client) => {
        const randomNumber = Math.floor(Math.random() * 10000) + 1;

        const message = {
            type: 'event',
            data: randomNumber
        };

        if (client.isSubscribed) {
            client.send(JSON.stringify(message));
        }
    });

    const nextInterval = Math.random() * (6000 - 1000);
    setTimeout(sendRandomNumber, nextInterval);
};

sendRandomNumber();

const randomConnectionShutdown = () => {
    wss.clients.forEach((client) => {
        if (client.stage >= 2) {
            client.terminate();
        }
    });

    const nextInterval = Math.random() * (60000 - 30000) + 30000;
    setTimeout(randomConnectionShutdown, nextInterval);
};

randomConnectionShutdown();

// Start the HTTP server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});