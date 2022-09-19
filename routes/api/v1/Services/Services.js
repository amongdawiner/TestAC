'use strict'

module.exports = async function (fastify, opts) 
{
      const addServiceOptions =
      {
        schema: {
          body: {
            type: 'object',
            required: ['category','name','description','code'],
            properties: 
            {
              category: { type: 'string' },
              name: { type: 'string' },
              common_name: { type: 'string' },
              description: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
        onRequest: [fastify.Authenticate] 
      }

      fastify.post('/AddService', addServiceOptions,  async function (request) 
      {  
        return  fastify.AddService({body:request.body, user:request.user})
      })

      fastify.post('/GetServices', { onRequest: [fastify.Authenticate] },  async function (request) 
      {  
        return  fastify.GetServices({body:request.body, user:request.user})
      })

      const toggleServiceOptions =
      {
        schema: {
          body: {
            type: 'object',
            required: ['Service_id'],
            properties: {
              name: { type: 'integer' },
            },
          },
        },
        onRequest: [fastify.Authenticate] 
      }
      fastify.post('/AuthorizeService', toggleServiceOptions,  async function (request) 
      {  
        return  fastify.AuthorizeService({body:request.body, user:request.user})
      })

      fastify.post('/RejectService', toggleServiceOptions,  async function (request) 
      {  
        return  fastify.RejectService({body:request.body, user:request.user})
      })

}
