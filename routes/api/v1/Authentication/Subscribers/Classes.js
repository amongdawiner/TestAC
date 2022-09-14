'use strict'

module.exports = async function (fastify, opts) 
{
      const addSubscriberClassOptions =
      {
        schema: {
          body: {
            type: 'object',
            required: ['name'],
            properties: {
              name: { type: 'string' },
            },
          },
        },
        onRequest: [fastify.Authenticate] 
      }

      fastify.post('/AddClass', addSubscriberClassOptions,  async function (request) 
      {  
        return  fastify.AddSubscriberClass({body:request.body, user:request.user})
      })

      fastify.post('/GetClasses', { onRequest: [fastify.Authenticate] },  async function (request) 
      {  
        return  fastify.GetSubscriberClasses()
      })

      const toggleSubscriberClassOptions =
      {
        schema: {
          body: {
            type: 'object',
            required: ['class_id'],
            properties: {
              name: { type: 'integer' },
            },
          },
        },
        onRequest: [fastify.Authenticate] 
      }
      fastify.post('/AuthorizeSubscriberClass', toggleSubscriberClassOptions,  async function (request) 
      {  
        return  fastify.AuthorizeSubscriberClass({body:request.body, user:request.user})
      })

      fastify.post('/RejectSubscriberClass', toggleSubscriberClassOptions,  async function (request) 
      {  
        return  fastify.RejectSubscriberClass({body:request.body, user:request.user})
      })

      fastify.post('/ActivateSubscriberClass', toggleSubscriberClassOptions,  async function (request) 
      {  
        return  fastify.ActivateSubscriberClass({body:request.body, user:request.user})
      })
      
      fastify.post('/DeactivateSubscriberClass', toggleSubscriberClassOptions,  async function (request) 
      {  
        return  fastify.DeactivateSubscriberClass({body:request.body, user:request.user})
      })

}
