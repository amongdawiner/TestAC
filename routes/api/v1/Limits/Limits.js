'use strict'

module.exports = async function (fastify, opts) 
{
      const addLimitOptions =
      {
        schema: {
          body: {
            type: 'object',
            required: ['subscriber_class_id','service_id','daily_limit'],
            properties: 
            {
              subscriber_class_id: { type: 'integer' },
              service_id: { type: 'integer' },
              daily_limit: { type: 'number' },
              weekly_limit: { type: 'integer' },
              monthly_limit: { type: 'integer' },
              yearly_limit: { type: 'integer' },
            },
          },
        },
        onRequest: [fastify.Authenticate] 
      }

      fastify.post('/AddLimit', addLimitOptions,  async function (request) 
      {  
        return  fastify.AddLimit({body:request.body, user:request.user})
      })

      fastify.post('/GetLimits', { onRequest: [fastify.Authenticate] },  async function (request) 
      {  
        return  fastify.GetLimits({body:request.body, user:request.user})
      })

      const toggleLimitOptions =
      {
        schema: {
          body: {
            type: 'object',
            required: ['limit_id'],
            properties: {
              name: { type: 'integer' },
            },
          },
        },
        onRequest: [fastify.Authenticate] 
      }
      fastify.post('/AuthorizeLimit', toggleLimitOptions,  async function (request) 
      {  
        return  fastify.AuthorizeLimit({body:request.body, user:request.user})
      })

      fastify.post('/RejectLimit', toggleLimitOptions,  async function (request) 
      {  
        return  fastify.RejectLimit({body:request.body, user:request.user})
      })

}
