'use strict';

const Hapi = require('@hapi/hapi');
const socket = require('socket.io')

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 1555
    });
    const io = socket(server.listener)
    console.log(io)
    nsp.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    server.route([
        {
            method: 'POST',
            path: '/v1/api/emitNewOrder',
            handler: (request, h) => {
                const {
                    payload
                } = request
                console.log(payload)
                // console.log(payload)
                // console.log(JSON.stringify(payload.data))
                const nsp = io.of('/5972247b42b4a32122357c4d');
                nsp.emit(`${payload.event}`, payload.data)
                // io.of(`/${payload.ref}`).emit(`${payload.event}`, payload.data)
                return h.response({data : 'ok'}).code(201)
            }
        },
        {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                return h.response({data : 'ok'}).code(201)
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