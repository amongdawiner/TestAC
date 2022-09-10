'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const bcrypt = require('bcrypt');
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    fastify.decorate("RegisterPortalUser", async function(request) {
        try {
            let existingCount = await prisma.users.count(
                {
                  where: {
                    mobile: request.mobile
                  }
                })

              if(existingCount==0)
              {
                const saltRounds = 10;
                const hashedPassword = bcrypt.hashSync(request.password, saltRounds);
                let newUser = 
                {
                  first_name : request.first_name,
                  middle_name : request.middle_name,
                  last_name : request.last_name,
                  mobile : request.mobile,
                  dob : new Date(request.dob),
                  password : hashedPassword
                }

                let user = await prisma.users.create({data:newUser })
                
                return {responseCode: "SUCCESS", message : "Portal User Registered Successfully", user : user}
            }
            else
            {
              return{responseCode : "DUPLICATE", error: "Duplicate User Details", message:"User Already Exist"};
            }
        } catch (err) {
          return err
        }
      })

      fastify.decorate("AuthenticatePortalUser", async function(request) {
        try {
            const user = await prisma.users.findFirst(
                {
                  where: {
                    mobile: request.mobile,
                  }
                })
                if(user)
                {
                    if(await bcrypt.compareSync(request.password, user.password))
                    {
                        let token = fastify.jwt.sign(user)
                        return {token}
                    }
                    else 
                    {
                      return {error: "Invalid Creds", message:"Invalid Credentials Provided"} 
                    }
                }
                return {error: "Invalid Creds", message:"Invalid Credentials Provided"} 
        } catch (err) {
          return err
        }
      })
})
