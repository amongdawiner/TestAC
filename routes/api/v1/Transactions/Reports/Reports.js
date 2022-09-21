'use strict'

module.exports = async function (fastify, opts) 
{        
      const accountReportOption = 
      {
        schema: 
        {
          body: 
          {
            type: 'object',
            required: ['account_id'],
            properties: 
            {
                account_id : { type: 'integer' },
            },
          },
        },
        onRequest: [fastify.AuthenticateAlternativeChannellsCustomer],
        preValidation: [fastify.StoreTransactionLog]
      }
      fastify.post('/Account', accountReportOption,  async function (request) 
      {  
        return  fastify.GetTransactions({body : request.body, user: request.user})
      })


      const reportOption = 
      {
        schema: 
        {
          body: 
          {
            type: 'object',
            required: [],
            properties: 
            {
            },
          },
        },
        onRequest: [fastify.Authenticate],
        preValidation: [fastify.StoreTransactionLog]
      }
      fastify.post('/General', reportOption,  async function (request) 
      {  
        return  fastify.GetTransactions({body : request.body, user: request.user})
      })

}
