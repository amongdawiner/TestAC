'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    fastify.decorate("AddTISS", async function(request) 
    {
      try 
      {
        let existingCount = await prisma.TISSs.count({where: {status: 'Pending', service_id:request.body.service_id, subscriber_class_id: request.body.subscriber_class_id}})
        if(existingCount==0)
        {
            let newTISS = 
            {
                subscriber_class_id : request.body.subscriber_class_id,
                service_id    : request.body.service_id,
                daily_TISS   : request.body.daily_TISS,
                weekly_TISS  : request.body.weekly_TISS != null ? request.body.weekly_TISS :  request.body.daily_TISS*7,
                monthly_TISS : request.body.monthly_TISS != null ? request.body.monthly_TISS :  request.body.daily_TISS*30,
                yearly_TISS  : request.body.yearly_TISS != null ? request.body.yearly_TISS :  request.body.daily_TISS*365,
                created_by    : request.user.id,
            }
            let TISS = await prisma.TISSs.create({data:newTISS })
            return {responseCode: "SUCCESS", message : "New TISS Added Successfully", TISS : TISS}
          }
          else
          {
              return{responseCode : "UNATTENDED_PENDING", error: "There is a Pending TISS", message:"Kindly request Authorizer to Authorize or Reject Latest TISS Request"};
          }
      } catch (err) {
        return err
      }
    })

    fastify.decorate("GetTISSs", async function(request) {
        try 
        {
          return prisma.TISSs.findMany(
            { 
              take: request.body.take != null ? request.body.take : undefined,
              skip : request.body.skip != null ? request.body.skip : undefined,
              cursor: request.body.cursor != null ? {id : request.body.cursor } : undefined,
              where : 
              { 
                subscriber_class_id : request.body.subscriber_class_id != null ? request.body.subscriber_class_id : undefined,
                service_id : request.body.service_id != null ? request.body.service_id : undefined,
                status : request.body.status != null ? request.body.status : undefined,
                created_at : 
                {
                  gte : request.body.start_date != null ? new Date(request.body.start_date) : undefined,
                  lte : request.body.end_date != null ? new Date(request.body.end_date) : undefined,
                }
              },
            orderBy: 
             {
              id: 'desc',
             }
            })
         } catch (err) 
        {
          return err
        }
      })
  

    fastify.decorate("AuthorizeTISS", async function(request) {
      try 
      {

        let thisRecord = await prisma.TISSs.findFirst({where: {status: 'Pending', id:request.body.TISS_id,}})

        if(thisRecord == null)
        {
             return {responseCode : "FAILED", message: "No Pending Record with ID : "+request.body.TISS_id, rowsAffected : 0}
        }

        let update = await prisma.TISSs.update(
        {
              where:
              {
                id: request.body.TISS_id,
              },
              data: 
              {
                status: 'Active',
                authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                authorized_by : request.user.id
              },
        })
        return {responseCode: "SUCCESS", message: "Successfully Authorized", TISS : update}
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("RejectTISS", async function(request) {
        try 
        {
          let thisRecord = await prisma.TISSs.findFirst({where: {status: 'Pending', id:request.body.TISS_id,}})
  
          if(thisRecord == null)
          {
               return {responseCode : "FAILED", message: "No Pending Record with ID : "+request.body.TISS_id, rowsAffected : 0}
          }
  
          let update = await prisma.TISSs.update(
          {
                where:
                {
                  id: request.body.TISS_id,
                },
                data: 
                {
                  status: 'Rejected',
                  authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                  authorized_by : request.user.id
                },
          })
          return {responseCode: "SUCCESS", message: "Successfully Rejected", TISS : update}
        } catch (err) {
          return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
        }
      })
})
