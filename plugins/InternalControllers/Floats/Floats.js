'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    fastify.decorate("AddFloat", async function(request) 
    {
      try 
      {
        let existingCount = await prisma.floats.count({where: {status: 'Pending'}})
        if(existingCount==0)
        {
            let lastRecord = await prisma.floats.findMany({where: {status: 'Active'},  orderBy: [{id: 'desc'}], take:1})
            lastRecord = lastRecord[0]
            let newFloat = 
            {
                previous_amount : (lastRecord) ? lastRecord.current_amount : 0,
                current_amount  : (lastRecord) ? lastRecord.current_amount + request.body.amount : request.body.amount,
                previous_balance : (lastRecord) ? lastRecord.current_balance : 0,
                current_balance  : (lastRecord) ? lastRecord.current_balance + request.body.amount : request.body.amount,
                created_by : request.user.id,
            }
            let Float = await prisma.floats.create({data:newFloat })
            return {responseCode: "SUCCESS", message : "New Float Added Successfully", float : Float}
          }
          else
          {
              return{responseCode : "UNATTENDED_PENDING", error: "There is a Pending Float", message:"Kindly request Authorizer to Authorize or Reject Latest Float Request"};
          }
      } catch (err) {
        return err
      }
    })

    fastify.decorate("GetFloats", async function(request) {
        try 
        {
          return prisma.floats.findMany(
            { 
              take: request.body.take != null ? request.body.take : undefined,
              skip : request.body.skip != null ? request.body.skip : undefined,
              cursor: request.body.cursor != null ? {id : request.body.cursor } : undefined,
              where : 
              { 
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
  

    fastify.decorate("AuthorizeFloat", async function(request) {
      try 
      {
        let lastRecord = await prisma.floats.findMany({where: {status: 'Active'},  orderBy: [{id: 'desc'}], take:1})
        lastRecord = lastRecord[0]

        let thisRecord = await prisma.floats.findFirst({where: {status: 'Pending', id:request.body.float_id,}})

        if(thisRecord == null)
        {
             return {responseCode : "FAILED", message: "No Pending Record with ID : "+request.body.float_id, rowsAffected : 0}
        }

        let update = await prisma.floats.update(
        {
              where:
              {
                id: request.body.float_id,
              },
              data: 
              {
                previous_balance  : (lastRecord) ? lastRecord.current_balance : 0,
                current_balance   : (lastRecord) ? lastRecord.current_balance + (thisRecord.current_amount-thisRecord.previous_amount) : thisRecord.current_amount,
                status: 'Active',
                authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                authorized_by : request.user.id
              },
        })
        return {responseCode: "SUCCESS", message: "Successfully Authorized", float : update}
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("RejectFloat", async function(request) {
        try 
        {
          let thisRecord = await prisma.floats.findFirst({where: {status: 'Pending', id:request.body.float_id,}})
  
          if(thisRecord == null)
          {
               return {responseCode : "FAILED", message: "No Pending Record with ID : "+request.body.float_id, rowsAffected : 0}
          }
  
          let update = await prisma.floats.update(
          {
                where:
                {
                  id: request.body.float_id,
                },
                data: 
                {
                  status: 'Rejected',
                  authorized_at : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                  authorized_by : request.user.id
                },
          })
          return {responseCode: "SUCCESS", message: "Successfully Rejected", float : update}
        } catch (err) {
          return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
        }
      })
})
