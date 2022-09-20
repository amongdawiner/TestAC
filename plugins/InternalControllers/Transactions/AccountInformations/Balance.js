'use strict'

const fp = require('fastify-plugin')
const { AsyncTask } = require('toad-scheduler')

module.exports = fp(async function (fastify, opts) 
{
    const prisma  = await fastify.prisma()

    fastify.decorate("BalanceEnquiry", async function(request) 
    {
      try 
      {
        //send balance enquiry request to ESB / BEM / CBS
        let account_id = request.body.account_id

        await delay(30000)

        let response = 
        {
            responseCode : "SUCCESS", message : "Balance Enquired Successfully",
            account : 
            {
                acccount_number:account_id,
                name : "ULRIK PETER",
                currency : "TZS"
            },
            available_balance : 120000.00,
            actual_balance : 11000.00
        }
        return response
      } catch (err) 
      {
        return err
      }
    })
})
