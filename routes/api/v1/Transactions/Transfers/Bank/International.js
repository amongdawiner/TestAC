'use strict'

module.exports = async function (fastify, opts) 
{        
      const transactionOption = 
      {
        schema: {
          body: 
          {
            type: 'object',
            required: ['amount'],
            properties: 
            {
              amount : { type: 'number' },
            },
          },
        },
        onRequest: [fastify.AuthenticateAlternativeChannellsCustomer],
        preValidation: [fastify.CheckAllTransactingEligibility]
      }
      fastify.post('/TT', transactionOption,  async function (request) 
      {  
        //return  fastify.RegisterSubscriber({body : request.body, user: request.user})
      })

}
