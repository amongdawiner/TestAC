'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    //const prisma  = await fastify.prisma()

    fastify.decorate("PreventResubmission", async function(request, reply)
    { 
        try 
        {
          //Preventing re-submission of the same transaction after certain duration ...
          fastify.log.info("Preventing Resubmission of the Transaction")
          return null
        } catch (err) {
          return err
        }
      })

      fastify.decorate("StoreTransactionLog", async function(request, reply)
      { 
          try 
          {
            //Save Transaction Log ...
            fastify.log.info("Recording Transaction")
          } catch (err) {
            return err
          }
      })

      fastify.decorate("CheckATransactingAccount", async function(request, reply)
      { 
          try 
          { 
            let transactionPayload = JSON.parse(await fastify.DencryptData({cipherText:request.body.payload}))
            let accountDetails = await fastify.GetSubscriberAccounts({body:{subscriber_id:request.user.id, id:transactionPayload.source_account_id, status:"Active"}, user:request.user})
            if(accountDetails[0] == null)
            {
              reply.send({responseCode : "INVALID_ACCOUNT", error: "Invalid Source Account", message:"Source Account is invalid or may be inactive or belongs to other customer "});
            }
          } catch (err) {
            return err
          }
        })

    fastify.decorate("CheckFloat", async function(request, reply)
    { 
        try 
        { 
          let transactionPayload = JSON.parse(await fastify.DencryptData({cipherText:request.body.payload}))
          let latestFloatDetails = await fastify.GetLatestActiveFloat()
          if(latestFloatDetails.current_balance < transactionPayload.amount)
          {
            reply.send({responseCode : "INSUFFICIENT_FLOAT", error: "Insufficient Working Fund", message:"Float Balance is Insufficient for Transacting : "+transactionPayload.amount});
          }
        } catch (err) {
          return err
        }
      })

    fastify.decorate("CheckServiceAvailabilityAndLimit", async function(request, reply)
    { 
        try 
        {
          //sum up daily transactions
          let transactionPayload = JSON.parse(await fastify.DencryptData({cipherText:request.body.payload}))
          let service_limits = await fastify.GetLimits({body:{subscriber_class_id:request.user.class_id, service_id:transactionPayload.service_id.service_id, status:"Active"}})
          if(service_limits[0].daily_limit < transactionPayload.amount)
          {
            reply.send({responseCode : "EXCEEDED_DAILY_LIMIT", error: "Exceeded Daily Transaction Amount", message:"The requested "+transactionPayload.amount+" has exceeded the daily limit of "+service_limits[0].daily_limit});
          }
        } catch (err) {
          return err
        }
    })

    fastify.decorate("CheckTransactingAccountStatus", async function(request, reply)
    { 
        try 
        {
          let transactionPayload = JSON.parse(await fastify.DencryptData({cipherText:request.body.payload}))
          let service_limits = await fastify.GetLimits({body:{subscriber_class_id:request.user.class_id, service_id:transactionPayload.service_id.service_id, status:"Active"}})
          if(service_limits[0].daily_limit < transactionPayload.amount)
          {
            reply.send({responseCode : "EXCEEDED_DAILY_LIMIT", error: "Exceeded Daily Transaction Amount", message:"The requested "+transactionPayload.amount+" has exceeded the daily limit of "+service_limits[0].daily_limit});
          }
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
