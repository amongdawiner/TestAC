'use strict'

module.exports = async function (fastify, opts) {
  fastify.post('/', async function (request, reply) {
    const res = fastify.EncryptData({plainText:request.body.payload})
    return res
  })

  fastify.post('/DecryptTest', async function (request, reply) {
    const res = fastify.DencryptData({cipherText:request.body.payload})
    return res
  })
}
