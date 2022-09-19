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
        preValidation: [fastify.CheckATransactingAccount, fastify.PreventResubmission, fastify.StoreTransactionLog, fastify.CheckFloat, fastify.CheckServiceAvailabilityAndLimit]
      }
      fastify.post('/Internal', transactionOption,  async function (request) 
      {  
        return {message:"Ready for Particular Transaction ...", transaction : JSON.parse(await fastify.DencryptData({cipherText:request.body.payload}))}
        //return  fastify.RegisterSubscriber({body : request.body, user: request.user})
      })

}
