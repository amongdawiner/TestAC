'use strict'

module.exports = async function (fastify, opts) 
{        
      const balanceEnquiryOption = 
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

      fastify.post('/BalanceEnquiry', balanceEnquiryOption,  async function (request) 
      {  
        return await fastify.BalanceEnquiry({body:request.body, user:request.user})
      })

}
