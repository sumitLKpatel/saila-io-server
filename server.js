'use strict';

const Hapi = require('@hapi/hapi');
const socket = require('socket.io')

const init = async () => {
    const server = Hapi.server({
        port: 1555,
        host: 'localhost'
    });
    const io = socket(server.listener)

    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            const {
                payload
            } = request
            io.of(`/${payload.ref}`).emit(payload.event, payload.data)
            return h.response({data : 'ok'}).status(201)
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();