'use strict'

module.exports = async function (fastify, opts) 
{        
      const transactionOption = 
      {
        schema: 
        {
          body: 
          {
            type: 'object',
            required: ['account_id'],
            properties: 
            {
              payload : { type: 'string' },
            },
          },
        },
        onRequest: [fastify.AuthenticateAlternativeChannellsCustomer],
      }
      fastify.post('/MiniStatementEnquiry', transactionOption,  async function (request) 
      {  
        return await fastify.MiniStatementEnquiry({body:request.body, user:request.user})
      })

}
