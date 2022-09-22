'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    const prisma  = await fastify.prisma()

    fastify.decorate("InternationalTransfer", async function(request) 
    {
      try 
      {
        let transactionPayload = JSON.parse(await fastify.DencryptData({cipherText:request.body.payload}))
        let referenceNumber =  await fastify.ReferenceNumber()

        let existingCount = await prisma.transactions.count({where: {status: 'Pending', service_id:parseInt(transactionPayload.service_id), created_by : request.user.id}})
     
        if(existingCount>0)// for temporary seeding ...
        {
            let newInternationalTransfer = 
            {
                request_number              : referenceNumber,
                service_id                  : transactionPayload.service_id,
                retrieval_reference_number  : transactionPayload.rrn,
                service_provider_id         : transactionPayload.service_provider_id,
                account_id                  : transactionPayload.source_account_id,
                destination                 : transactionPayload.destination,
                amount                      : transactionPayload.amount * Math.random(),
                narration                   : transactionPayload.narration,
                nature_of_transaction       : "Dr",
                channel                     : "APPS",
                transaction_date            : transactionPayload.transaction_date,
                created_by                  : request.user.id,
                authorized_at               : new Date(new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().split('.')[0].replace('T',' ')),
                authorized_by               : request.user.id,
                status                      : "Completed"
            }

            let transaction = await prisma.transactions.create({data : newInternationalTransfer })
            
            //Deduct float Balance

            //consume BEM / ESB / FCUB WebService / API and if it is successfully then Update transaction details including status, thirdy party reference no etc ...
            
            // Send SMS alert

            if(transactionPayload.save_payee)
            {
              // shall be placed in que
              //save payee information
            }
            
            return {responseCode: "SUCCESS", message : "Transaction Completed Successfully", transaction : transaction}
        }
        else
        {
            return{responseCode : "DUPLICATE", error: "There are unattended transaction(s)", message:"Kindly wait for sometime before initiating another transfer"};
        }
      } catch (err) 
      {
        return err
      }
    })
})
