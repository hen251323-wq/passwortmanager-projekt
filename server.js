const http = require('http');

const hostname = '127.0.0.1'; // localhost
const port = 3000;

let currentSetJson = null;

function receiveSetJson(request, response) {
        let jsonString = '';

        request.on('data', (data) => {
                jsonString += data;
        });

        request.on('end', () => {
                currentSetJson = jsonString;

                console.log('Received set json string ' + jsonString);
        });
}

function sendSetJson(request, response) {

        response.setHeader('Content-Type', 'application/json');

        if (currentSetJson == null) {

                console.log('Supposed to send set json string, but had nothing stored.');

                response.statusCode = 204;

                response.end('');
                return;
        }

        console.log('Send set json string.');
        response.end(currentSetJson);
}

const server = http.createServer((request, response) => {

        response.setHeader('Access-Control-Allow-Origin', '*');

        if (request.method == 'POST') {

                receiveSetJson(request, response);
                return;
        }

        if (request.method == 'GET') {
                const url = new URL(request.url || '', `http://${request.headers.host}`);
                response.statusCode = 200;

                if (url.pathname === '/connect') {

                        response.setHeader('Content-Type', 'text/plain');
                        response.end();

                        console.log('Received connection.');
                        return;
                }

                sendSetJson(request, response);
                return;
        }

        response.statusCode = 404;

        response.end();
});

server.listen(port, hostname, () => {

  console.log(`Server running at http://${hostname}:${port}/`);
});