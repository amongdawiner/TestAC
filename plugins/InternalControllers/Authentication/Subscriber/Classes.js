'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    fastify.decorate("AddSubscriberClass", async function(request) 
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
              let newSubscriberClass = 
              {
                name : request.body.name,
                created_by : request.user.id,
              }
              let subscriberClass = await prisma.subscriber_classes.create({data:newSubscriberClass })
              return {responseCode: "SUCCESS", message : "Subscriber Class Added Successfully", class : subscriberClass}
          }
          else
          {
              return{responseCode : "DUPLICATE", error: "Duplicate Subscriber Class Details", message:"Subscriber Class Already Exist"};
          }
      } catch (err) {
        return err
      }
    })

    fastify.decorate("GetSubscriberClasses", async function(request) {
      try {
          return prisma.subscriber_classes.findMany()
      } catch (err) {
        return err
      }
    })

    fastify.decorate("AuthorizeSubscriberClass", async function(request) {
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
        return update;
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("RejectSubscriberClass", async function(request) {
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
        return update;
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("DeactivateSubscriberClass", async function(request) {
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

    fastify.decorate("ActivateSubscriberClass", async function(request) {
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
