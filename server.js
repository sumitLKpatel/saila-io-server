'use strict';

const Hapi = require('@hapi/hapi');
const socket = require('socket.io')
var url = require('url');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 1555
    });
    const io = socket(server.listener)
    io.on('connection', (socket) => {
        const { ns } = url.parse(socket.handshake.url, true).query;
        if (ns) {
            const nsp = io.of(`/${ns}`);
            nsp.on('connection', function (socket) {
                console.log(ns, ' connected');
                socket.on('disconnect', () => {
                    console.log(ns, ' disconnected');
                });
            });
        }
        console.log('server nsp->%s', socket.nsp.name)
        socket.on('disconnect', () => {
            console.log(socket.nsp.name, 'user disconnected');
        });
    });

    server.route([
        {
            method: 'POST',
            path: '/v1/api/emitEvent',
            handler: (request, h) => {
                const {
                    payload
                } = request
                io.of(`/${payload.ref}`).emit(`${payload.event}`, payload.data)
                return h.response({ data: 'ok' }).code(201)
            }
        },
        {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                return h.response({ data: 'Socket server is running' }).code(201)
            }
        }
    ]);

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();