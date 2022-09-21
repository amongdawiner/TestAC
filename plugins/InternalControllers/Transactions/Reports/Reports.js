'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const prisma  = await fastify.prisma()

    fastify.decorate("GetTransactions", async function(request) {
        try 
        {
          return prisma.transactions.findMany(
            { 
              take: request.body.take != null ? request.body.take : undefined,
              skip : request.body.skip != null ? request.body.skip : undefined,
              cursor: request.body.cursor != null ? {id : request.body.cursor } : undefined,
              where : 
              { 
                account_id : request.body.account_id != null ? request.body.account_id : undefined,
                status : request.body.status != null ? request.body.status : undefined,
                service_provider_id : request.body.service_provider_id != null ? request.body.service_provider_id : undefined,
                service_id : request.body.service_id != null ? request.body.service_id : undefined,
                request_number : request.body.request_number != null ? request.body.request_number : undefined,
                retrieval_reference_number : request.body.retrieval_reference_number != null ? request.body.retrieval_reference_number : undefined,
                thirdparty_reference_number : request.body.thirdparty_reference_number != null ? request.body.thirdparty_reference_number : undefined,
                destination : request.body.destination != null ? request.body.destination : undefined,
                nature_of_transaction : request.body.nature_of_transaction != null ? request.body.nature_of_transaction : undefined,
                channel : request.body.channel != null ? request.body.channel : undefined,
                transaction_date : request.body.transaction_date != null ? request.body.transaction_date : undefined,
                narration : request.body.narration != null ? request.body.narration : undefined,
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
  
})
