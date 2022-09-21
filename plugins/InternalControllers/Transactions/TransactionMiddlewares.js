'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    fastify.decorate("CheckTransferGeneralParams", async function(request, reply)
    { 
        try 
        {
          let transactionPayload = JSON.parse(await fastify.DencryptData({cipherText:request.body.payload}))
          
          if((transactionPayload.service_id) == null)
          {
            reply.code(400).send({responseCode:"UNDEFINED_SERVICE_ID", message : "Invalid or Undefined Service ID or Code"})
          }

          if((transactionPayload.service_provider_id) == null)
          {
            reply.code(400).send({responseCode:"UNDEFINED_SERVICE_PROVIDER_ID", message : "Invalid or Undefined Service Provider ID or Code"})
          }
              
          if((transactionPayload.amount) == null)
          {
            reply.code(400).send({responseCode:"UNDEFINED_AMOUNT", message : "Invalid or Undefined Transaction Amount"})
          }
              
          if((transactionPayload.source_account_id) == null)
          {
            reply.code(400).send({responseCode:"UNDEFINED_SOURCE_ACCOUNT", message : "Invalid or Undefined Source Account ID or Code"})
          }
             
          if((transactionPayload.destination) == null)
          {
            reply.code(400).send({responseCode:"UNDEFINED_DESTINATION_ACCOUNT", message : "Invalid or Undefined Destionation Account ID or Code"})
          }

              
        } catch (err) 
        {
          reply.code(400).send(err)
        }
      })

    fastify.decorate("PreventResubmission", async function(request, reply)
    { 
        try 
        {
          //Preventing re-submission of the same transaction after certain duration ...
          //By using request id generated by following date time 
          return null
        } catch (err) {
          reply.send(err)
        }
      })

      fastify.decorate("StoreTransactionLog", async function(request, reply)
      { 
          try 
          {
            //Save Transaction Log ...
            fastify.log.info("Recording Transaction")
          } catch (err) {
            reply.send(err)
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
            reply.send(err)
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
          reply.send(err)
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
          reply.send(err)
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
          reply.send(err)
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
          reply.send(err)
        }
    })

})
