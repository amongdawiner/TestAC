'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    fastify.decorate("AddTT", async function(request) 
    {
      try 
      {
        let existingCount = await prisma.TTs.count({where: {status: 'Pending', service_id:request.body.service_id, subscriber_class_id: request.body.subscriber_class_id}})
        if(existingCount==0)
        {
            let newTT = 
            {
                subscriber_class_id : request.body.subscriber_class_id,
                service_id    : request.body.service_id,
                daily_TT   : request.body.daily_TT,
                weekly_TT  : request.body.weekly_TT != null ? request.body.weekly_TT :  request.body.daily_TT*7,
                monthly_TT : request.body.monthly_TT != null ? request.body.monthly_TT :  request.body.daily_TT*30,
                yearly_TT  : request.body.yearly_TT != null ? request.body.yearly_TT :  request.body.daily_TT*365,
                created_by    : request.user.id,
            }
            let TT = await prisma.TTs.create({data:newTT })
            return {responseCode: "SUCCESS", message : "New TT Added Successfully", TT : TT}
          }
          else
          {
              return{responseCode : "UNATTENDED_PENDING", error: "There is a Pending TT", message:"Kindly request Authorizer to Authorize or Reject Latest TT Request"};
          }
      } catch (err) {
        return err
      }
    })

    fastify.decorate("GetTTs", async function(request) {
        try 
        {
          return prisma.TTs.findMany(
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
  

    fastify.decorate("AuthorizeTT", async function(request) {
      try 
      {

        let thisRecord = await prisma.TTs.findFirst({where: {status: 'Pending', id:request.body.TT_id,}})

        if(thisRecord == null)
        {
             return {responseCode : "FAILED", message: "No Pending Record with ID : "+request.body.TT_id, rowsAffected : 0}
        }

        let update = await prisma.TTs.update(
        {
              where:
              {
                id: request.body.TT_id,
              },
              data: 
              {
                status: 'Active',
                authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                authorized_by : request.user.id
              },
        })
        return {responseCode: "SUCCESS", message: "Successfully Authorized", TT : update}
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("RejectTT", async function(request) {
        try 
        {
          let thisRecord = await prisma.TTs.findFirst({where: {status: 'Pending', id:request.body.TT_id,}})
  
          if(thisRecord == null)
          {
               return {responseCode : "FAILED", message: "No Pending Record with ID : "+request.body.TT_id, rowsAffected : 0}
          }
  
          let update = await prisma.TTs.update(
          {
                where:
                {
                  id: request.body.TT_id,
                },
                data: 
                {
                  status: 'Rejected',
                  authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                  authorized_by : request.user.id
                },
          })
          return {responseCode: "SUCCESS", message: "Successfully Rejected", TT : update}
        } catch (err) {
          return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
        }
      })
})
