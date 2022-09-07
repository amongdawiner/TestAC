'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return { 'Solution': 'eVikoba', 'versionCode':'v0.001','baseUrlPath':'/api/v1/' }
  })
}
