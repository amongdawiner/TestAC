'use strict'

module.exports = async function (fastify, opts) 
{        
      const nameQueryingOption = 
      {
        schema: 
        {
          body: 
          {
            type: 'object',
            required: ['destination', 'service_id', 'amount'],
            properties: 
            {
                destination : { type: 'string' },
                service_id  : { type: 'integer' },
                amount      : { type: 'number' },
            },
          },
        },
        onRequest: [fastify.AuthenticateAlternativeChannellsCustomer],
      }

      fastify.post('/Internal', nameQueryingOption,  async function (request) 
      {  
        return await fastify.MNONameQuerying({body:request.body, user:request.user})
      })

}
