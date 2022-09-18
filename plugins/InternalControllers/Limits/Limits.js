'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const prisma  = await fastify.prisma()

    fastify.decorate("AddLimit", async function(request) 
    {
      try 
      {
        let existingCount = await prisma.limits.count({where: {status: 'Pending', service_id:request.body.service_id, subscriber_class_id: request.body.subscriber_class_id}})
        if(existingCount==0)
        {
            let newLimit = 
            {
                subscriber_class_id : request.body.subscriber_class_id,
                service_id    : request.body.service_id,
                daily_limit   : request.body.daily_limit,
                weekly_limit  : request.body.weekly_limit != null ? request.body.weekly_limit :  request.body.daily_limit*7,
                monthly_limit : request.body.monthly_limit != null ? request.body.monthly_limit :  request.body.daily_limit*30,
                yearly_limit  : request.body.yearly_limit != null ? request.body.yearly_limit :  request.body.daily_limit*365,
                created_by    : request.user.id,
            }
            let Limit = await prisma.limits.create({data:newLimit })
            return {responseCode: "SUCCESS", message : "New Limit Added Successfully", Limit : Limit}
          }
          else
          {
              return{responseCode : "UNATTENDED_PENDING", error: "There is a Pending Limit", message:"Kindly request Authorizer to Authorize or Reject Latest Limit Request"};
          }
      } catch (err) {
        return err
      }
    })

    fastify.decorate("GetLimits", async function(request) {
        try 
        {
          return prisma.limits.findMany(
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

    fastify.decorate("AuthorizeLimit", async function(request) {
      try 
      {

        let thisRecord = await prisma.limits.findFirst({where: {status: 'Pending', id:request.body.limit_id,}})

        if(thisRecord == null)
        {
             return {responseCode : "FAILED", message: "No Pending Record with ID : "+request.body.limit_id, rowsAffected : 0}
        }

        let update = await prisma.limits.update(
        {
              where:
              {
                id: request.body.limit_id,
              },
              data: 
              {
                status: 'Active',
                authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                authorized_by : request.user.id
              },
        })
        return {responseCode: "SUCCESS", message: "Successfully Authorized", limit : update}
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("RejectLimit", async function(request) {
        try 
        {
          let thisRecord = await prisma.limits.findFirst({where: {status: 'Pending', id:request.body.limit_id,}})
  
          if(thisRecord == null)
          {
               return {responseCode : "FAILED", message: "No Pending Record with ID : "+request.body.limit_id, rowsAffected : 0}
          }
  
          let update = await prisma.limits.update(
          {
                where:
                {
                  id: request.body.limit_id,
                },
                data: 
                {
                  status: 'Rejected',
                  authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                  authorized_by : request.user.id
                },
          })
          return {responseCode: "SUCCESS", message: "Successfully Rejected", limit : update}
        } catch (err) {
          return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
        }
      })
})
