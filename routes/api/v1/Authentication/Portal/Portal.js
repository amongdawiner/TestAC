'use strict'

module.exports = async function (fastify, opts) 
{
      const registerUserOptions = {
        schema: {
          body: {
            type: 'object',
            required: ['first_name','middle_name','last_name','mobile','dob','password'],
            properties: {
              first_name: { type: 'string' },
              middle_name: { type: 'string' },
              last_name: { type: 'string' },
              mobile: { type: 'integer', minimum:9 },
            },
          },
          response: {
            201: {
              type: 'object',
              properties: {
                users: {
                  nullable: true,
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                    },
                    first_name: {
                      type: 'string',
                    },
                    last_name: {
                      type: 'string',
                    },
                  },
                  additionalProperties: false,
                },
              },
            },
          },
        },
      }
      fastify.post('/Register', registerUserOptions,  async function (request) 
      {  
        return  fastify.RegisterPortalUser(request.body)
      })

      const signInOptions = {
        schema: {
          body: {
            type: 'object',
            required: ['mobile','password'],
            properties: {
              mobile: { type: 'integer', minimum:9 },
              password: { type: 'string' },
            },
          },
        },
      }
    
      fastify.post('/Authenticate', signInOptions, async function (request) 
      {
        return fastify.AuthenticatePortalUser(request.body)
      })
    
      fastify.post('/Authenticated', { onRequest: [fastify.Authenticate] }, async function (request) 
      {
          return request.user;
      })

}
