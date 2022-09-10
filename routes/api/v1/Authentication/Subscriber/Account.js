'use strict'

module.exports = async function (fastify, opts) 
{
      const addSubscriberAccountOptions =
      {
        schema: {
          body: {
            type: 'object',
            required: ['subscriber_id', 'account_number'],
            properties: {
                subscriber_id: { type: 'integer' },
                is_main: { type: 'integer' },
                account_number: { type: 'string' },
                class: { type: 'string' },
            },
          },
        },
        onRequest: [fastify.Authenticate] 
      }

      fastify.post('/AddAccount', addSubscriberAccountOptions,  async function (request) 
      {  
        return  fastify.AddSubscriberAccount({body:request.body, user:request.user})
      })

      fastify.post('/GetAccounts', { onRequest: [fastify.Authenticate] },  async function (request) 
      {  
        return  fastify.GetSubscriberAccounts()
      })

      const toggleSubscriberAccountsOptions =
      {
        schema: {
          body: {
            type: 'object',
            required: ['account_id'],
            properties: {
              name: { type: 'integer' },
            },
          },
        },
        onRequest: [fastify.Authenticate] 
      }
      fastify.post('/AuthorizeSubscriberAccount', toggleSubscriberAccountsOptions,  async function (request) 
      {  
        return  fastify.AuthorizeSubscriberAccount({body:request.body, user:request.user})
      })

      fastify.post('/RejectSubscriberAccount', toggleSubscriberAccountsOptions,  async function (request) 
      {  
        return  fastify.RejectSubscriberAccount({body:request.body, user:request.user})
      })

      fastify.post('/ActivateSubscriberAccount', toggleSubscriberAccountsOptions,  async function (request) 
      {  
        return  fastify.ActivateSubscriberAccount({body:request.body, user:request.user})
      })
      
      fastify.post('/DeactivateSubscriberAccount', toggleSubscriberAccountsOptions,  async function (request) 
      {  
        return  fastify.DeactivateSubscriberAccount({body:request.body, user:request.user})
      })

}
