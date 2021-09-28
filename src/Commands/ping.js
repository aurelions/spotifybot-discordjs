const Command = require('../Structures/Command')

module.exports = new Command({
    name: "pingme",
    description: "Show bot's ping!",
    
    async run(message, args, client) { 
        
        message.reply(`Ping ${client.ws.ping} ms`)
    }
})