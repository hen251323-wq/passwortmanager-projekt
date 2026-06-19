const http = require('http');
const mongodb = require('mongodb');

const hostname = '127.0.0.1'; // localhost
const port = 3000;

const mongoUrl = 'mongodb://127.0.0.1:27017';
const mongoDatabaseName = 'password-manager';
const mongoCollectionName = 'set';
const mongoClient = new mongodb.MongoClient(mongoUrl);

let setCollection = null;

async function receiveSetJson(request, response) {
        let jsonString = '';

        request.on('data', (data) => {
                jsonString += data;
        });

        request.on('end', () => {
                const localSet = JSON.parse(jsonString);
                
                await setCollection.insertOne({
                        name: localSet.name,
                        json: jsonString
                });

                console.log('Received set json string ' + jsonString);
        });
}

function sendSetJson(setName, response) {
        const setEntry = await setCollection.findOne({ name: setName });

        if (setEntry == null) {

                console.log('Requested set "' + setName + '" does not exist, skipping...');

                response.statusCode = 204;

                response.end('');
                return;
        }

        response.setHeader('Content-Type', 'application/json');
        console.log('Send set json string for set "' + setName + '".');
        response.end(setEntry.json);
}

async function initHttpServer() {
        const server = http.createServer((request, response) => {

                response.setHeader('Access-Control-Allow-Origin', '*');

                if (request.method == 'POST') {

                        await receiveSetJson(request, response);
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

                        if (url.pathname === '/search') {
                         
                                sendSetJson(url.searchParams.get('name'), response);
                                return
                        }
                }

                response.statusCode = 404;

                response.end();
        });

        server.listen(port, hostname, () => {

                console.log(`Server running at http://${hostname}:${port}/`);
        });
}

async function initMongoClient() {
        await mongoClient.connect();

        const database = mongoClient.db(mongoDatabaseName);
        setCollection = database.collection(mongoCollectionName);

        console.log('MongoDB Database connection secured.')
}

async function main() {
        
        initHttpServer();
        initMongoClient();
}

main();