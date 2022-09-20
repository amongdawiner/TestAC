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
        preValidation: [fastify.CheckATransactingAccount, fastify.PreventResubmission, fastify.StoreTransactionLog, fastify.CheckFloat, fastify.CheckServiceAvailabilityAndLimit]
      }
      fastify.post('/BalanceEnquiry', transactionOption,  async function (request) 
      {  
        return await fastify.BalanceEnquiry({body:request.body, user:request.user})
      })

}
