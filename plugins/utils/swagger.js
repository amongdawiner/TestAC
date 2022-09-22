const fp = require('fastify-plugin')

module.exports = fp(async function(fastify, opts) {
    // fastify.register(require('@fastify/swagger'), 
    // {
    //     routePrefix: '/doc',
    //     swagger: {
    //       info: {
    //         title: 'NBC Alternative Channels Backend',
    //         description: 'APIs for NBC Alternative Channels',
    //         version: '0.0.1'
    //       },
    //       host: '22.32.245.88:3000',
    //       schemes: ['http'],
    //       consumes: ['application/json'],
    //       produces: ['application/json'],
    //       externalDocs: 
    //       {
    //         url: 'https://docs.google.com/document/d/e/2PACX-1vRmPYAjJNY00Eo6mU6yDkxqcNcRsys7Md6cWobnpVbM0ZroSxUNZIxXvAEbTw0xh52lhCQVTp-TS9Bz/pub',
    //         description: 'Find More NBC AC Documentation Here'
    //       },
    //       securityDefinitions: {
    //         BearerAuth: {
    //           type: 'apiKey',
    //           name: 'Authorization',
    //           in: 'header'
    //         }
    //       },
    //     },
    //     exposeRoute: true
    //   })
})