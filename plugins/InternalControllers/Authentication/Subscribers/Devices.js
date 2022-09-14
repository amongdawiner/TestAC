'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const bcrypt = require('bcrypt');
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    fastify.decorate("AddSubscriberDevice", async function(request) 
    {
      try {
            const otp = (Math.random()*32340000).toString().substring(0,4);
            const saltRounds = 10;
            const hashedPassword = bcrypt.hashSync(otp, saltRounds);

            let existingCount = await prisma.devices.count({ where: {subscriber_id : request.user.id, udid : request.body.udid }})
            if(existingCount==0)
            { 
                let newDevice =   
                {
                    created_by : request.user.id,
                    authorized_by : request.user.id,
                    udid : request.body.udid,
                    subscriber_id : request.user.id,
                    model : request.body.model,
                    name : request.body.name,
                    otp : hashedPassword
                }

            let device = await prisma.devices.create({data : newDevice})
            //send OTP for device registration, shall be qued in kafka/rabbitmq
            return {responseCode: "SUCCESS", message : "Subscriber Device Registered with the Pending Verification of OTP", device : {name : device.name, model : device.model, udid : device.udid}}
          }
          else
          {
              return{responseCode : "DUPLICATE", error: "Duplicate Subscriber Device", message:"Subscriber Device Already Exist"};
          }
      } catch (err) {
        return err
      }
    })

    fastify.decorate("GetSubscriberDevice", async function(request) {
      try {
          return prisma.accounts.findMany()
      } catch (err) {
        return err
      }
    })


    fastify.decorate("VerifyDeviceOTP", async function(request) {
      try 
      {
        let device = await prisma.devices.findFirst({where: {subscriber_id: request.user.id, udid:request.body.udid, status:"Active"}})
        if(device)
        {
          let verify = await prisma.devices.update(
            {
                  where:
                  {
                    id: device.id,
                  },
                  data: 
                  {
                    is_otp_verified : 1
                  },
            })
          
            return {responseCode: "SUCCESS", message : "Device Verified Successfully", device : {name : verify.name, model : device.model, udid : verify.udid}}
         
        }
        return {responseCode: "DEVICE_NOT_FOUND", message:"Invalid Subscriber Device UDID or Device Maybe Inactive or Not Belonged to Respective Subscriber"} 
      } catch (err) {
        return {statusCode:err.statusCode, errorCode:err.code, message : (err.code == "P2025" ? "Record Not Found" : err.code)}
      }
    })

    fastify.decorate("AuthorizeSubscriberDevice", async function(request) {
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

    fastify.decorate("RejectSubscriberDevice", async function(request) {
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

    fastify.decorate("DeactivateSubscriberDevice", async function(request) {
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

    fastify.decorate("ActivateSubscriberDevice", async function(request) {
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
