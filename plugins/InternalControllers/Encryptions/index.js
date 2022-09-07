'use strict'

const fp = require('fastify-plugin')
const CryptoJS = require("crypto-js")

module.exports = fp(async function (fastify, opts) 
{
    fastify.decorate("EncryptData", async function(request, reply) {
        try {
            return CryptoJS.AES.encrypt(JSON.stringify(request.plainText), process.env.AES_SECRET_KEY).toString()
        } catch (err) {
          return err
        }
      })

      fastify.decorate("DencryptData", async function(request, reply) {
        try {
            const bytes  = CryptoJS.AES.decrypt(request.cipherText, process.env.AES_SECRET_KEY);
            return bytes.toString(CryptoJS.enc.Utf8)
        } catch (err) {
          return err
        }
      })
})
