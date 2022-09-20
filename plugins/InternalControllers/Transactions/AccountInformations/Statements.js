'use strict'

const fp = require('fastify-plugin')
const { AsyncTask } = require('toad-scheduler')

module.exports = fp(async function (fastify, opts) 
{
    const prisma  = await fastify.prisma()

    fastify.decorate("MiniStatementEnquiry", async function(request) 
    {
      try 
      {
        //send mini statement enquiry request to ESB / BEM / CBS

        let account = await fastify.GetSubscriberAccounts({body:{id:request.body.account_id, subscriber_id:request.user.id}})

        if(account[0])
        {
            account = account[0]
            let transactions =   [
                                    {
                                      type : "Dr",
                                      value_date : Date.now().toString(),
                                      description : "Transfer to wallet",
                                      currency : account.currency,
                                      amount : (Math.random()*32340000/2).toFixed(2)
                                    },
                                    {
                                      type : "Dr",
                                      value_date : Date.now().toString(),
                                      description : "Airtime Purchase to +255766192332",
                                      currency : account.currency,
                                      amount : (Math.random()*32340000/2).toFixed(2)
                                    },
                                    {
                                      type : "Cr",
                                      value_date : Date.now().toString(),
                                      description : "Transfer to wallet",
                                      currency : account.currency,
                                      amount : (Math.random()*32340000/2).toFixed(2)
                                    },
                                    {
                                      type : "Dr",
                                      value_date : Date.now().toString(),
                                      description : "mVISA Tap & Pay at Fery Kigambon",
                                      currency : account.currency,
                                      amount : (Math.random()*32340000/2).toFixed(2)
                                    },
                                    {
                                      type : "Cr",
                                      value_date : Date.now().toString(),
                                      description : "Being salary of Sept, 22",
                                      currency : account.currency,
                                      amount : (Math.random()*32340000/2).toFixed(2)
                                    },
                                    {
                                      type : "Cr",
                                      value_date : Date.now().toString(),
                                      description : "Transfer to wallet",
                                      currency : account.currency,
                                      amount : (Math.random()*32340000/2).toFixed(2)
                                    },
                                    {
                                      type : "Dr",
                                      value_date : Date.now().toString(),
                                      description : "Transfer to wallet MPESA",
                                      currency : account.currency,
                                      amount : (Math.random()*32340000/2).toFixed(2)
                                    },
                                    {
                                      type : "Dr",
                                      value_date : Date.now().toString(),
                                      description : "Transfer to wallet",
                                      currency : account.currency,
                                      amount : (Math.random()*32340000/2).toFixed(2)
                                    },
                                    {
                                      type : "Dr",
                                      value_date : Date.now().toString(),
                                      description : "Principal Loan Liquidation",
                                      currency : account.currency,
                                      amount : (Math.random()*32340000/2).toFixed(2)
                                    },
                                    {
                                      type : "Cr",
                                      value_date : Date.now().toString(),
                                      description : "W2B from +255766192332",
                                      currency : account.currency,
                                      amount : (Math.random()*32340000/2).toFixed(2)
                                    }
                                  ]

            let response = 
            {
                responseCode : "SUCCESS", message : "Balance Enquired Successfully",
                account : 
                {
                    acccount_number : account.acccount_number,
                    currency : account.currency
                },
                statement : transactions
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
