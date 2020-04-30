'use strict';

const Hapi = require('@hapi/hapi');
const socket = require('socket.io')
var url = require('url');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 1555
    });
    const io = socket(server.listener)
    let nspString = null
    io.on('connection', (socket) => {
        const { ns } = url.parse(socket.handshake.url, true).query;
        nspString = ns
        console.log('nsp->%s', nspString)
        console.log('server nsp->%s', socket.nsp.name)
        socket.on('disconnect', () => {
            console.log(socket.nsp.name, 'user disconnected');
        });
    });
    const nsp = io.of(`/${nspString}`);
    nsp.on('connection', function (socket) {
        console.log(nsp, 'is connected');
    });

    server.route([
        {
            method: 'POST',
            path: '/v1/api/emitEvent',
            handler: (request, h) => {
                const {
                    payload
                } = request
                // io.of(`/${payload.ref}`).emit(`${payload.event}`, payload.data)
                nsp.emit(`${payload.event}`, payload.data)
                // io.of(`/${payload.ref}`).emit(`${payload.event}`, payload.data)
                return h.response({ data: 'ok' }).code(201)
            }
        },
        {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                return h.response({ data: 'ok' }).code(201)
            }
        },
        {
            method: 'GET',
            path: '/initsocket/{ref}',
            handler: (request, h) => {
                const {
                    params: { ref },
                } = request

                io.of(`/${ref}`).on('connection', (socket) => {
                    console.log('server nsp->%s', socket.nsp.name)
                    socket.on('disconnect', () => {
                        console.log(socket.nsp.name, 'user disconnected');
                    });
                });
                return h.response({ data: 'ok' }).code(201)
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