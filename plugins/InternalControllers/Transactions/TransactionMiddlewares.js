'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    fastify.decorate("StoreTransactionLog", async function(request, reply)
    { 
        try 
        {
          //Save Transaction Log ...
          fastify.log.fatal("Recording Transaction")
        } catch (err) {
          return err
        }
    })

    fastify.decorate("PreventResubmission", async function(request, reply)
    { 
        try 
        {
          //Preventing re-submission of the same transaction after certain duration ...
          fastify.log.fatal("Preventing Resubmission of the Transaction")
          return null
        } catch (err) {
          return err
        }
      })

    fastify.decorate("CheckFloat", async function(request, reply)
    { 
        try 
        {
          fastify.log.fatal("Checking Float ...")
          let transactionRequest = request.body
          await fastify.log.fatal(transactionRequest)
          //return reply.code(401).send(transactionRequest)
          let latestFloatDetails = await fastify.GetLatestActiveFloat()
          let amount = request.body.amount
          fastify.log.fatal((latestFloatDetails.current_balance > 111000) ? "Greater" : "Small")
        } catch (err) {
          return err
        }
      })

    fastify.decorate("CheckServiceAvailabilityAndLimit", async function(request, reply)
    { 
        try 
        {
          fastify.log.fatal("Check Service Availability And Limit ...")
        } catch (err) {
          return err
        }
    })

    fastify.decorate("CheckAllTransactingEligibility", async function(request, reply)
    { 
        try 
        {
          await fastify.PreventResubmission()
          await fastify.StoreTransactionLog()
          await fastify.CheckFloat()
          await fastify.CheckServiceAvailabilityAndLimit()
        } catch (err) 
        {
          return err
        }
    })

})
