'use strict'

module.exports = async function (fastify, opts) 
{
      const addFloatOptions =
      {
        schema: {
          body: {
            type: 'object',
            required: ['amount'],
            properties: {
              name: { type: 'number' },
            },
          },
        },
        onRequest: [fastify.Authenticate] 
      }

      fastify.post('/AddFloat', addFloatOptions,  async function (request) 
      {  
        return  fastify.AddFloat({body:request.body, user:request.user})
      })

      fastify.post('/GetFloats', { onRequest: [fastify.Authenticate] },  async function (request) 
      {  
        return  fastify.GetFloats({body:request.body, user:request.user})
      })

      const toggleFloatOptions =
      {
        schema: {
          body: {
            type: 'object',
            required: ['float_id'],
            properties: {
              name: { type: 'integer' },
            },
          },
        },
        onRequest: [fastify.Authenticate] 
      }
      fastify.post('/AuthorizeFloat', toggleFloatOptions,  async function (request) 
      {  
        return  fastify.AuthorizeFloat({body:request.body, user:request.user})
      })

      fastify.post('/RejectFloat', toggleFloatOptions,  async function (request) 
      {  
        return  fastify.RejectFloat({body:request.body, user:request.user})
      })

}
