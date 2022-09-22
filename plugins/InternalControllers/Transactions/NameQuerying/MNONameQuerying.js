'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    fastify.decorate("MNONameQuerying", async function(request) 
    {
        try 
        {
            let destination = await fastify.ValidatePhoneNumber({body : {phone_number : request.body.destination}})
        
            if(destination.error)
            {
                return destination
            }

            let transaction_amount  = request.body.amount
            let service_id          =  request.body.service_id
            let service_details     = await fastify.GetServices({body : {id : service_id}})
            let service_charge      = transaction_amount * 0.1 // from channels

            //Query receiver details from thirdy part ...
            // ....

            let response = 
            {
                service : 
                {
                    id                  : service_details.id,
                    category            : service_details.category,
                    name                : service_details.name,
                    common_name         : service_details.common_name,
                    description         : service_details.description,
                    transaction_amount  : transaction_amount,
                    transaction_charge  : service_charge
                },
                receiver : 
                {
                    name        : "Chinaa Swai",
                    reference   : destination,
                    network     : "Vodacom Tanzania"
                }
            }

            return response
            
        } catch (error) {
            return error
        }

    })
})
