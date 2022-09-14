'use strict'

module.exports = async function (fastify, opts) 
{
      const addSubscriberDeviceOptions =
      {
        schema: {
          body: {
            type: 'object',
            required: ['udid', 'name', 'model'],
            properties: {
                udid: { type: 'string' },
                name: { type: 'string' },
                model: { type: 'string' },
            },
          },
        },
        onRequest: [fastify.Authenticate] 
      }

      fastify.post('/AddDevice', addSubscriberDeviceOptions,  async function (request) 
      {  
        return  fastify.AddSubscriberDevice({body:request.body, user:request.user})
      })

      fastify.post('/GetDevices', { onRequest: [fastify.Authenticate] },  async function (request) 
      {  
        return  fastify.GetSubscriberDevices()
      })

      const VerifyDeviceOTPOptions =
      {
        schema: {
          body: {
            type: 'object',
            required: ['udid'],
            properties: {
                udid: { type: 'string' },
            },
          },
        },
        onRequest: [fastify.AuthenticateAlternativeChannellsCustomer] 
      }
      fastify.post('/VerifyDeviceOTP', VerifyDeviceOTPOptions,  async function (request) 
      {  
        return  fastify.VerifyDeviceOTP({body:request.body, user:request.user})
      })

      const toggleSubscriberDevicesOptions =
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
      fastify.post('/AuthorizeSubscriberDevice', toggleSubscriberDevicesOptions,  async function (request) 
      {  
        return  fastify.AuthorizeSubscriberDevice({body:request.body, user:request.user})
      })

      fastify.post('/RejectSubscriberDevice', toggleSubscriberDevicesOptions,  async function (request) 
      {  
        return  fastify.RejectSubscriberDevice({body:request.body, user:request.user})
      })

      fastify.post('/ActivateSubscriberDevice', toggleSubscriberDevicesOptions,  async function (request) 
      {  
        return  fastify.ActivateSubscriberDevice({body:request.body, user:request.user})
      })
      
      fastify.post('/DeactivateSubscriberDevice', toggleSubscriberDevicesOptions,  async function (request) 
      {  
        return  fastify.DeactivateSubscriberDevice({body:request.body, user:request.user})
      })

}
