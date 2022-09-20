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
              account_id : { type: 'string' },
            },
          },
        },
        onRequest: [fastify.AuthenticateAlternativeChannellsCustomer],
      }
      fastify.post('/MiniStatementEnquiry', transactionOption,  async function (request) 
      {  
        return await fastify.MiniStatementEnquiry({body:request.body, user:request.user})
      })


      const fullStatementOption = 
      {
        schema: 
        {
          body: 
          {
            type: 'object',
            required: ['account_id', 'date_from', 'date_to'],
            properties: 
            {
              account_id : { type: 'string' },
              date_from  : { type : 'string'},
              date_to    : { type : 'string'}
            },
          },
        },
        onRequest: [fastify.AuthenticateAlternativeChannellsCustomer],
      }

      fastify.post('/FullStatementEnquiry', fullStatementOption,  async function (request) 
      {  
        return await fastify.FullStatementEnquiry({body:request.body, user:request.user})
      })

}
