const http = require('http');
const mongodb = require('mongodb');
const crypto = require('crypto');

const hostname = '127.0.0.1'; // localhost
const port = 3000;

const mongoUrl = 'mongodb://127.0.0.1:27017';
const mongoDatabaseName = 'password-manager';
const mongoCollectionName = 'set';
const mongoClient = new mongodb.MongoClient(mongoUrl);

let setCollection = null;

function createHash(value) {
        const hash = crypto.createHash('sha256');

        hash.update(value);
        return hash.digest('hex');
}

async function receiveSetJson(setName, setKey, request, response) {
        let jsonString = '';

        request.on('data', (data) => {
                jsonString += data;
        });

        request.on('end', async () => {
                
                await setCollection.updateOne(
                        { name: setName, key: createHash(setKey) },
                        { $set: { json: jsonString }},
                        { upsert: true }
                );

                console.log('Received set json string "' + jsonString + '" with key "' + setKey + '"');
                response.end();
        });
}

async function sendSetJson(setName, setKey, response) {
        const setEntry = await setCollection.findOne({ name: setName, key: createHash(setKey) });

        if (setEntry == null) {

                console.log('Requested set "' + setName + '" with key "' + setKey + '" does not exist, skipping...');

                response.statusCode = 204;

                response.end('');
                return;
        }

        response.setHeader('Content-Type', 'application/json');
        console.log('Send set json string for set "' + setName + '".');
        response.end(setEntry.json);
}

async function initHttpServer() {

        const server = http.createServer(async (request, response) => {
                const url = new URL(request.url || '', `http://${request.headers.host}`);
                response.statusCode = 200;

                response.setHeader('Access-Control-Allow-Origin', '*');

                if (request.method == 'POST') {

                        if (url.pathname === '/update') {
                                const name = url.searchParams.get('name');
                                const key = url.searchParams.get('key');

                                try {
                                        await receiveSetJson(name, key, request, response);
                                } catch ({ name, message }) {
                                        console.log(name + ': ' + message);
                                }

                                return;
                        }
                }

                if (request.method == 'GET') {

                        if (url.pathname === '/connect') {

                                response.setHeader('Content-Type', 'text/plain');
                                response.end();

                                console.log('Received connection from "' + request.url + '".');
                                return;
                        }

                        if (url.pathname === '/search') {
                                const name = url.searchParams.get('name');
                                const key = url.searchParams.get('key');
                         
                                try {
                                        await sendSetJson(name, key, response);
                                } catch ({ name, message }) {
                                        console.log(name + ': ' + message);
                                }

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
        
        await initHttpServer();
        await initMongoClient();
}

main();