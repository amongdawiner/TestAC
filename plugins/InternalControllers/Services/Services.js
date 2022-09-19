'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const prisma  = await fastify.prisma()

    fastify.decorate("AddService", async function(request) 
    {
      try 
      {
        let existingCount = await prisma.services.count({where: {OR : [{code:request.body.code}, {name:request.body.name}, {common_name: request.body.common_name}]}})
        if(existingCount==0)
        {
            let newService = 
            {
                code : request.body.code,
                name    : request.body.name,
                common_name   : request.body.common_name != null ? request.body.common_name :  request.body.name,
                category  : await prisma.services_category.CASH_WITHDRAW,
                description  : request.body.description,
                created_by    : request.user.id,
            }
            let service = await prisma.services.create({data:newService })
            return {responseCode: "SUCCESS", message : "New Service Added Successfully", service : service}
          }
          else
          {
              return{responseCode : "DUPLICATE", error: "Service Exists Already", message:request.body.name+" Already Exists !"};
          }
      } catch (err) {
        return err
      }
    })

    fastify.decorate("GetServices", async function(request) {
        try 
        {
          return prisma.services.findMany(
            { 
              take: request.body.take != null ? request.body.take : undefined,
              skip : request.body.skip != null ? request.body.skip : undefined,
              cursor: request.body.cursor != null ? {id : request.body.cursor } : undefined,
              where : 
              { 
                name : request.body.name != null ? request.body.name : undefined,
                common_name : request.body.common_name != null ? request.body.common_name : undefined,
                category : request.body.category != null ? request.body.category : undefined,
                code : request.body.code != null ? request.body.code : undefined,
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

    fastify.decorate("AuthorizeService", async function(request) {
      try 
      {

        let thisRecord = await prisma.services.findFirst({where: {status: 'Pending', id:request.body.service_id,}})

        if(thisRecord == null)
        {
             return {responseCode : "FAILED", message: "No Pending Record with ID : "+request.body.service_id, rowsAffected : 0}
        }

        let update = await prisma.services.update(
        {
              where:
              {
                id: request.body.service_id,
              },
              data: 
              {
                status: 'Active',
                authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                authorized_by : request.user.id
              },
        })
        return {responseCode: "SUCCESS", message: "Successfully Authorized", service : update}
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("RejectService", async function(request) {
        try 
        {
          let thisRecord = await prisma.services.findFirst({where: {status: 'Pending', id:request.body.Service_id,}})
  
          if(thisRecord == null)
          {
               return {responseCode : "FAILED", message: "No Pending Record with ID : "+request.body.service_id, rowsAffected : 0}
          }
  
          let update = await prisma.services.update(
          {
                where:
                {
                  id: request.body.service_id,
                },
                data: 
                {
                  status: 'Rejected',
                  authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                  authorized_by : request.user.id
                },
          })
          return {responseCode: "SUCCESS", message: "Successfully Rejected", service : update}
        } catch (err) {
          return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
        }
      })
})
