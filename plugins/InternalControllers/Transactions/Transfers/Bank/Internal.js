'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    fastify.decorate("AddInternall", async function(request) 
    {
      try 
      {
        let existingCount = await prisma.Internalls.count({where: {status: 'Pending', service_id:request.body.service_id, subscriber_class_id: request.body.subscriber_class_id}})
        if(existingCount==0)
        {
            let newInternall = 
            {
                subscriber_class_id : request.body.subscriber_class_id,
                service_id    : request.body.service_id,
                daily_Internall   : request.body.daily_Internall,
                weekly_Internall  : request.body.weekly_Internall != null ? request.body.weekly_Internall :  request.body.daily_Internall*7,
                monthly_Internall : request.body.monthly_Internall != null ? request.body.monthly_Internall :  request.body.daily_Internall*30,
                yearly_Internall  : request.body.yearly_Internall != null ? request.body.yearly_Internall :  request.body.daily_Internall*365,
                created_by    : request.user.id,
            }
            let Internall = await prisma.Internalls.create({data:newInternall })
            return {responseCode: "SUCCESS", message : "New Internall Added Successfully", Internall : Internall}
          }
          else
          {
              return{responseCode : "UNATTENDED_PENDING", error: "There is a Pending Internall", message:"Kindly request Authorizer to Authorize or Reject Latest Internall Request"};
          }
      } catch (err) {
        return err
      }
    })

    fastify.decorate("GetInternalls", async function(request) {
        try 
        {
          return prisma.Internalls.findMany(
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
  

    fastify.decorate("AuthorizeInternall", async function(request) {
      try 
      {

        let thisRecord = await prisma.Internalls.findFirst({where: {status: 'Pending', id:request.body.Internall_id,}})

        if(thisRecord == null)
        {
             return {responseCode : "FAILED", message: "No Pending Record with ID : "+request.body.Internall_id, rowsAffected : 0}
        }

        let update = await prisma.Internalls.update(
        {
              where:
              {
                id: request.body.Internall_id,
              },
              data: 
              {
                status: 'Active',
                authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                authorized_by : request.user.id
              },
        })
        return {responseCode: "SUCCESS", message: "Successfully Authorized", Internall : update}
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("RejectInternall", async function(request) {
        try 
        {
          let thisRecord = await prisma.Internalls.findFirst({where: {status: 'Pending', id:request.body.Internall_id,}})
  
          if(thisRecord == null)
          {
               return {responseCode : "FAILED", message: "No Pending Record with ID : "+request.body.Internall_id, rowsAffected : 0}
          }
  
          let update = await prisma.Internalls.update(
          {
                where:
                {
                  id: request.body.Internall_id,
                },
                data: 
                {
                  status: 'Rejected',
                  authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                  authorized_by : request.user.id
                },
          })
          return {responseCode: "SUCCESS", message: "Successfully Rejected", Internall : update}
        } catch (err) {
          return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
        }
      })
})
