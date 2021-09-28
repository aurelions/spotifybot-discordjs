async function defaultCommand(message, commands) {
    let { author, channel } = message;
    if (channel.type !== 'dm')
        await message.delete()

    author.send(`Hey, here are some commands to help your little brain **!${commands.join('** , **!')}**`)
}

module.exports = defaultCommand;