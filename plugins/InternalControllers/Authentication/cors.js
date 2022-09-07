'use strict'

const cors = require('@fastify/cors')

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    await fastify.register(cors, { 
        origin: (origin, cb) => {
            // const hostname = new URL(origin).hostname
            // if(hostname === "localhost"){
            //   //  Request from localhost will pass
            //   cb(null, true)
            //   return
            // }
            // // Generate an error on other origins, disabling access
            // cb(new Error("Not allowed"), false)
            cb(null, true)
          }
      })
})
