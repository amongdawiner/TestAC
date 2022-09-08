'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const bcrypt = require('bcrypt');
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    fastify.decorate("RegisterSubscriber", async function(request) {
        try 
        {
            let existingCount = await prisma.subscribers.count( {where: { OR :[ {cif : request.body.cif}, {phone_number : request.body.phone_number}]}})

              if(existingCount==0)
              {
                const otp = (Math.random()*32340000).toString().substring(0,4);
                const saltRounds = 10;
                const hashedPassword = bcrypt.hashSync(otp, saltRounds);
                let newSubscriber = 
                {
                  branch_code : request.body.branch_code,
                  cif : request.body.cif,
                  class_id : request.body.class_id,
                  first_name : request.body.first_name,
                  middle_name : request.body.middle_name,
                  last_name : request.body.last_name,
                  phone_number : request.body.mobile.toString(),
                  email : request.body.email,
                  imsi : request.body.imsi,
                  preferred_language : request.body.preferred_language,
                  password : hashedPassword,
                  created_by : request.user.id,
                }

                let subscriber = await prisma.subscribers.create({data:newSubscriber })
                //send initial OTP for device registration /// for each new device
                return {responseCode: "SUCCESS", message:"Subscriber Registered Successfully", subscriber : {name : subscriber.first_name+ " "+subscriber.last_name, phone_number:subscriber.phone_number}};
            }
            else
            {
              return{responseCode : "DUPLICATE", error: "Duplicate Subscriber Details", message:"Subscriber Already Exist"};
            }
        } catch (err) {
          return err
        }
    })

    fastify.decorate("AuthenticateSubscriber", async function(request)
    {
      try 
      {
          const subscriber = await prisma.subscribers.findFirst({where: {phone_number: request.phone_number}})
          if(subscriber && await bcrypt.compareSync(request.password, subscriber.password))
          {
              return {responseCode: "SUCCESS", message:"Successfully Authenticated", token : fastify.jwt.sign(subscriber)}
          }
          return {error: "Invalid Creds", message:"Invalid Credentials Provided"} 
      } catch (err)
      {
        return err
      }
    })

    fastify.decorate("GetSubscribers", async function(request) {
      try 
      {
        return prisma.subscribers.findMany(
          { 
            take: request.body.take != null ? request.body.take : undefined,
            skip : request.body.skip != null ? request.body.skip : undefined,
            cursor: request.body.cursor != null ? {id : request.body.cursor } : undefined,
            where : 
            { 
              phone_number : request.body.mobile != null ? request.body.mobile : undefined,
              status : request.body.status != null ? request.body.status : undefined,
              created_at : 
              {
                gte : request.body.start_date != null ? new Date(request.body.start_date) : undefined,
                lte : request.body.end_date != null ? new Date(request.body.end_date) : undefined,
              }
            },
            select :
            {
              id : true,
              class_id : true,
              cif : true,
              branch_code : true,
              preferred_language : true,
              first_name : true,
              phone_number : true,
              imsi : true,
              email : true,
              created_at : true,
              status : true,
              middle_name : true,
              last_name : true,
              accounts : 
              {
                select: 
                {
                  acccount_number: true,
                  main : true,
                  class : true,
                  status : true,
                },
              },
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

    fastify.decorate("AuthorizeSubscriber", async function(request) {
      try 
      {
        let update = await prisma.subscribers.update(
        {
              where:
              {
                id: request.body.subscriber_id,
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

    fastify.decorate("RejectSubscriber", async function(request) {
      try 
      {
        let update = await prisma.subscribers.update(
        {
              where:
              {
                id : request.body.subscriber_id
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

    fastify.decorate("DeactivateSubscriber", async function(request) {
      try 
      {
        let update = await prisma.subscribers.update(
        {
              where:
              {
                id : request.body.subscriber_id
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

    fastify.decorate("ActivateSubscriber", async function(request) {
      try 
      {
        let update = await prisma.subscribers.update(
        {
              where:
              {
                id : request.body.subscriber_id
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
