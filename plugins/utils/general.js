'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) 
{
    fastify.decorate("ReferenceNumber", async function(request) 
    {
        let currentdate = new Date();
        let year=currentdate.getFullYear();
        let month=currentdate.getMonth()+1;
        let day=currentdate.getDate();
        let hours=currentdate.getHours();
        let minutes=currentdate.getMinutes();
        let seconds=currentdate.getSeconds();
        let milliseconds=currentdate.getMilliseconds();
      
        let monthD;
        let dayD;
        let hoursD;
        let minutesD;
        let secondsD;
      
        if(month < 10)
        {
          monthD='0' + month;
        }
        else
        {
          monthD=month;
        }
      
        if(day < 10)
        {
          dayD='0' + day;
        }
        else
        {
          dayD=day;
        }
      
        if(hours < 10)
        {
          hoursD='0' + hours;
        }
        else
        {
          hoursD=hours;
        }
      
      
        if(minutes < 10)
        {
          minutesD='0' + minutes;
        }
        else
        {
          minutesD=minutes;
        }
      
        if(seconds < 10)
        {
          secondsD='0' + seconds;
        }
        else
        {
          secondsD=seconds;
        }
      
        let combined=year.toString()+""+monthD.toString()+""+dayD.toString()+""+hoursD.toString()+""+minutesD.toString()+""+secondsD.toString();
        combined = combined+""+milliseconds
        return combined     
    })
})
