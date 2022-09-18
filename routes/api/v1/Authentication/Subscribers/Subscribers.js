'use strict'

module.exports = async function (fastify, opts) 
{        
      const registerSubscriberOptions = {
        schema: {
          body: {
            type: 'object',
            required: ['first_name','last_name','mobile','cif', 'class_id'],
            properties: {
              cif : { type: 'string' },
              class_id : { type: 'integer' },//validate class via foreign key constraints
              first_name: { type: 'string' },
              middle_name: { type: 'string' },
              last_name: { type: 'string' },
              mobile: { type: 'integer', minimum:9 },//validate mobile
              email : { type: 'string' },//validate email
              imsi : { type: 'string' },
              preferred_language : { type: 'string' },
            },
          },
        },
        onRequest: [fastify.Authenticate]
      }
      fastify.post('/Register', registerSubscriberOptions,  async function (request) 
      {  
        return  fastify.RegisterSubscriber({body : request.body, user: request.user})
      })

      const signInOptions = {
        schema: 
        {
          body: 
          {
            type: 'object',
            required: ['mobile','password','udid', 'device_name','device_model'],
            properties: 
            {
              mobile : { type: 'integer', minimum:9 },
              password : { type: 'string' },
              udid : { type: 'string' },
              device_name : { type: 'string' },
              device_model : { type: 'string' }
            },
          },
        },
      }
    
      fastify.post('/Authenticate', signInOptions, async function (request) 
      {
        return fastify.AuthenticateSubscriber(request.body)
      })


      const ChangeSubscriberPasswordOptions = {
        schema: {
          body: {
            type: 'object',
            required: ['mobile','old_password','new_password'],
            properties: {
              mobile: { type: 'integer', minimum:9 },
              old_password: { type: 'string' },
              new_password: { type: 'string' },
            },
          },
        },
      }
    
      fastify.post('/ChangeSubscriberPassword', ChangeSubscriberPasswordOptions, async function (request) 
      {
        return fastify.ChangeSubscriberPassword(request.body)
      })

    
      fastify.post('/Authenticated', { onRequest: [fastify.AuthenticateAlternativeChannellsCustomer] }, async function (request) 
      {
          return request.user;
      })

      const toggleSubscriberStatusOptions =
      {
        schema: {
          body: {
            type: 'object',
            required: ['subscriber_id'],
            properties: {
              name: { type: 'integer' },
            },
          },
        },
        onRequest: [fastify.Authenticate] 
      }

      fastify.post('/AuthorizeSubscriber', toggleSubscriberStatusOptions,  async function (request) 
      {  
        return  fastify.AuthorizeSubscriber({body:request.body, user:request.user})
      })

      fastify.post('/RejectSubscriber', toggleSubscriberStatusOptions,  async function (request) 
      {  
        return  fastify.RejectSubscriber({body:request.body, user:request.user})
      })

      fastify.post('/ActivateSubscriber', toggleSubscriberStatusOptions,  async function (request) 
      {  
        return  fastify.ActivateSubscriber({body:request.body, user:request.user})
      })
      
      fastify.post('/DeactivateSubscriber', toggleSubscriberStatusOptions,  async function (request) 
      {  
        return  fastify.DeactivateSubscriber({body:request.body, user:request.user})
      })

      fastify.post('/GetSubscribers', { onRequest: [fastify.Authenticate] },  async function (request) 
      {  
        return  fastify.GetSubscribers({body:request.body, user:request.user})
      })

}
