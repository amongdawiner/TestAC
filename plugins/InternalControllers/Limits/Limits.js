'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    fastify.decorate("AddSubscriberLimit", async function(request) 
    {
      try {
          let existingCount = await prisma.subscriber_classes.count(
              {
                where: {
                  name: request.body.name
                }
              })

            if(existingCount==0)
            {
              let newSubscriberLimit = 
              {
                name : request.body.name,
                created_by : request.user.id,
              }
              let SubscriberLimit = await prisma.subscriber_classes.create({data:newSubscriberLimit })
              return {responseCode: "SUCCESS", message : "Subscriber Class Added Successfully", class : SubscriberLimit}
          }
          else
          {
              return{responseCode : "DUPLICATE", error: "Duplicate Subscriber Class Details", message:"Subscriber Class Already Exist"};
          }
      } catch (err) {
        return err
      }
    })

    fastify.decorate("GetSubscriberLimites", async function(request) {
      try {
          return prisma.subscriber_classes.findMany()
      } catch (err) {
        return err
      }
    })

    fastify.decorate("AuthorizeSubscriberLimit", async function(request) {
      try 
      {
        let update = await prisma.subscriber_classes.update(
        {
              where:
              {
                id: request.body.class_id,
              },
              data: 
              {
                status: 'Active',
                authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                authorized_by : request.user.id
              },
        })
        return {responseCode: "SUCCESS", message:"Successfully Authorized", subscriber : {class_id:update.class_id, name:update.name, status : update.status}}
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("RejectSubscriberLimit", async function(request) {
      try 
      {
        let update = await prisma.subscriber_classes.update(
        {
              where:
              {
                id : request.body.class_id
              },
              data: 
              {
                status: 'Rejected',
                authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                authorized_by : request.user.id
              },
        })
        return {responseCode: "SUCCESS", message:"Successfully Rejected", class : update}
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("DeactivateSubscriberLimit", async function(request) {
      try 
      {
        let update = await prisma.subscriber_classes.update(
        {
              where:
              {
                id : request.body.class_id
              },
              data: 
              {
                status: 'Inactive',
                authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                authorized_by : request.user.id
              },
        })
        return update;
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("ActivateSubscriberLimit", async function(request) {
      try 
      {
        let update = await prisma.subscriber_classes.update(
        {
              where:
              {
                id : request.body.class_id
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
        return update;
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })
})
