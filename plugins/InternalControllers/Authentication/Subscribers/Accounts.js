'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    fastify.decorate("AddSubscriberAccount", async function(request) 
    {
      try {
            let existingCount = await prisma.accounts.count({ where: {acccount_number : request.body.account_number }})
            if(existingCount==0)
            { 
                let newAccount =   
                {
                    created_by : request.user.id,
                    main : request.body.is_main,
                    class : request.body.class,
                    subscriber_id : request.body.subscriber_id,
                    acccount_number : request.body.account_number
                }

            let account = await prisma.accounts.create({data : newAccount})

            return {responseCode: "SUCCESS", message : "Subscriber Account Added Successfully", account : account}
          }
          else
          {
              return{responseCode : "DUPLICATE", error: "Duplicate Subscriber Account Details", message:"Subscriber Account Already Exist"};
          }
      } catch (err) {
        return err
      }
    })

    fastify.decorate("GetSubscriberAccounts", async function(request) {
      try {
          return prisma.accounts.findMany()
      } catch (err) {
        return err
      }
    })

    fastify.decorate("AuthorizeSubscriberAccount", async function(request) {
      try 
      {
        let update = await prisma.accounts.update(
        {
              where:
              {
                id: request.body.account_id,
              },
              data: 
              {
                status: 'Active',
                authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                authorized_by : request.user.id
              },
        })
        return {responseCode: "SUCCESS", message:"Successfully Authorized", account : update}
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("RejectSubscriberAccount", async function(request) {
      try 
      {
        let update = await prisma.accounts.update(
        {
              where:
              {
                id : request.body.account_id
              },
              data: 
              {
                status: 'Rejected',
                authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                authorized_by : request.user.id
              },
        })
        return {responseCode: "SUCCESS", message:"Successfully Rejected", account : update}
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("DeactivateSubscriberAccount", async function(request) {
      try 
      {
        let update = await prisma.accounts.update(
        {
              where:
              {
                id : request.body.account_id
              },
              data: 
              {
                status: 'Inactive',
                authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                authorized_by : request.user.id
              },
        })
        return {responseCode: "SUCCESS", message:"Successfully Deactivated", account : update}
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("ActivateSubscriberAccount", async function(request) {
      try 
      {
        let update = await prisma.accounts.update(
        {
              where:
              {
                id : request.body.account_id
              },
              data: 
              {
                status: 'Pending',
                authorized_at : null,
                authorized_by : null,
                created_by : request.user.id,
                created_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
              },
        })
        return {responseCode: "SUCCESS", message:"Successfully Activated", account : update}
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })
})
