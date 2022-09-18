'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const { PrismaClient } = require('@prisma/client')
    
    fastify.decorate("prisma", async function(request) 
    {
     let prisma
      try 
      {
        if (!global.prisma) 
        {
            global.prisma = new PrismaClient()
        }

        prisma = global.prisma

        return prisma

      } catch (err) 
      {
        return err
      }
    })
})
