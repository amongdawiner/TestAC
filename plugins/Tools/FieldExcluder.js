'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    fastify.decorate("exclude", async function(request) 
    {
        for (let key of request.keys)
        {
            delete request.data[key]
        }
        
        return request.data
    })
})
