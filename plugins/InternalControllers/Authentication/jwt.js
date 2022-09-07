'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    fastify.register(require('@fastify/jwt'), 
    {
        secret: process.env.JWT_SECRET_KEY,
        sign: {
          expiresIn: '1000m'
        }
    },
    )

    fastify.decorate("Authenticate", async function(request, reply)
    {
        try 
        {
          //fastify.log.fatal(request.headers.authorization)
          //CHECK IF THERE IS NO AUTHORIZATION HEADERS
          if(!request.headers.authorization)
          {
            reply.code(401).send({responseCode:401, error : "Unauthorized", message : "No Authorization Headers Found"})
          }

          //GET TOKEN DETAILS
          const token = request.headers.authorization.replace('Bearer ', '')
          const user = fastify.jwt.decode(token)

          //VALIDATE USER IF NECESSARY
          if(!user.id && !user.first_name && !user.mobile)
          {
            reply.code(401).send({responseCode:401, error : "Unauthorized", message : "Invalid User Provided"})
          }
          
          //CHECK IF TOKEN IS EXPIRED
          if(Date.now() >= user.exp * 1000)
          {
            reply.code(401).send({responseCode:401, error : "Unauthorized", message : "Access Token Expired, Kindly Renew Again"})
          }

          await request.jwtVerify()


        } catch (err) {
          return err
        }
      })
})
