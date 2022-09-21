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
            required: ['payload'],
            properties: 
            {
              payload : { type: 'string' },
            },
          },
        },
        onRequest: [fastify.AuthenticateAlternativeChannellsCustomer],
        preValidation: [fastify.CheckTransferGeneralParams, fastify.CheckATransactingAccount, fastify.PreventResubmission, fastify.StoreTransactionLog, fastify.CheckFloat, fastify.CheckServiceAvailabilityAndLimit]
      }
      fastify.post('/InternalTransfer', transactionOption,  async function (request) 
      {  
        return  fastify.InternalTransfer({body : request.body, user: request.user})
      })

}
