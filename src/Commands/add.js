const Spotify = require('../spotify');
const Command = require("../Structures/Command");

module.exports = new Command ({

    name:"add",
    description:"Add a new song to the playlist!",
    async run(message, args, client){
    const spotify = new Spotify(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN)
    const voteTimeMs = 60000;
    

    async function add(client, message, args) {
        const { channel: sentToChannel, author } = message;
        const [url] = args;

        if (sentToChannel.type !== 'dm')
            await message.delete()

        let trackData;
        try {
            trackData = await spotify.getTrackDataFromUrl(url);
        } catch (e) {
            return author.send(
                `Nice try 🤓 , but the right way to use the **!add** command is:
                **!add** *<spotify-song-link>*
                Give it another go, champ 🤞`
            );
        }
        let { uri, name, artists } = trackData;

        const voteChannel = await client.channels.fetch(SONG_VOTE_CHANNEL)
        const voteMessage = await voteChannel.send(
            `📯 Voting for **${name}** by *${artists.join(', ')}* has begun! 🏁
        **You have ${voteTimeMs / 1000} seconds** *to vote(react to this comment) for( <:${EMOJI_ID_FOR}> ) or against( <:${EMOJI_ID_AGAINST}> ) it being added!*
        🌲 Proposed by ${author} 🌳 
        ${url} @here`
        )

        const reactFilter = (reaction) => emojiRatings.has(reaction.emoji.identifier);
        const reactions = await voteMessage.awaitReactions(reactFilter, {
            time: voteTimeMs
        })

        if (reactions.array().length === 0)
            return await voteChannel.send(`Wait what 😕 ??? No one voted 🤔 ... I can't do anything if no one voted 🤷 `)

        const tally = reactions.reduce((acc, reaction) => {
            const emojiId = reaction.emoji.identifier
            const voteCount = reaction.count;
            let tally = emojiRatings.get(emojiId) * voteCount
            return tally += acc;
        }, 0)

        await voteChannel.send('🎉 The results are in 🥁 :')
        let resultMessage = ''
        reactions.forEach(reaction => {
            resultMessage += `🔹 <:${reaction.emoji.identifier}> : ${reaction.count}\n`
        })
        await voteChannel.send(resultMessage)

        if (tally < 0) {
            await voteChannel.send(`📢 The people have spoken. *${name}* has not been added 😿 .Maybe try again when everyone is asleep? 😇 `)
        } else if (tally > 0) {
            await spotify.addTrackToPlaylist(uri, SPOTIFY_PLAYLIST_ID)
            await voteChannel.send(`Its official 🥳 ! *${name}* has been added 🎊 ! Great taste, ${author} 😎`)
        } else {
            await voteChannel.send(`Its a draw 😨 ! \n ... 🎲 🪙 flipping a coin 🤞...`)
            await new Promise(resolve => setTimeout(resolve, 1500));
            if (Math.floor(Math.random() * 2)) {
                await spotify.addTrackToPlaylist(uri, SPOTIFY_PLAYLIST_ID)
                await voteChannel.send(`${name} has been added 🤯 ! ${author} Go out and buy a lotto ticket 🍀`)
            } else {
                await voteChannel.send(`Well 😶 ... Better luck next time ${author} 😿 `)
            }
        }
    }
    }

    
});

