'use strict'

const fp = require('fastify-plugin')
const { AsyncTask } = require('toad-scheduler')

module.exports = fp(async function (fastify, opts) 
{
    fastify.decorate("BalanceEnquiry", async function(request) 
    {
      try 
      {
        //send balance enquiry request to ESB / BEM / CBS
        let account = await fastify.GetSubscriberAccounts({body:{id:parseInt(request.body.account_id), subscriber_id:request.user.id}})
        
        if(account[0])
        {
            account = account[0]
            let response = 
            {
                responseCode : "SUCCESS", message : "Balance Enquired Successfully",
                account : 
                {
                    acccount_number : account.acccount_number,
                    currency : account.currency
                },
                available_balance : (Math.random()*32340000/2).toFixed(2),
                actual_balance : (Math.random()*32340000/2).toFixed(2)
            }
            return response
        }
        return {responseCode : "INVALID_ACCOUNT", message : "No Account Found with ID : "+request.body.account_id}
      } catch (err) 
      {
        return err
      }
    })
})
