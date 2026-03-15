import type { VoiceState } from 'discord.js'

import { ChannelType, Events, PermissionFlagsBits } from 'discord.js'

import { client } from '@/shared/config/client'

import { registerTempChannel } from './tempChannels'

export const LOBBY_CHANNEL_ID = '1408046517142687774'

export function createTempVCEvent() {
    client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        const userWasNotOnServer = !oldState.channel && newState.channel?.id === LOBBY_CHANNEL_ID // when user was not in the other channel
        const member = newState.member

        if (userWasNotOnServer) {
            console.log(`User ${newState.member?.user.tag} joined lobby`)

            try {
                const channelName = await createChannel(newState)
                console.log(`Created personal channel: ${channelName} for ${member?.user.tag}`)
            } catch (error) {
                console.error('Error creating personal channel:', error)
            }
        }
        const userWasInTheChannel = oldState.channel
        const userInTheChannel = newState.channel
        const isChannelChanged = oldState.channel?.id !== newState.channel?.id
        const isNewLobby = newState.channel?.id === LOBBY_CHANNEL_ID

        if (userWasInTheChannel && userInTheChannel && isChannelChanged && isNewLobby) {
            console.log(`User ${newState.member?.user.tag} switched to lobby`)

            try {
                const channelName = await createChannel(newState)
                console.log(`Created personal channel for switcher: ${channelName}`)
            } catch (error) {
                console.error('Error creating channel for switcher:', error)
            }
        }
    })
}

const createChannel = async (newState: VoiceState) => {
    const guild = newState.guild
    const member = newState.member

    if (!member) {
        console.error('Member is null')
        return
    }

    const permissionOverwrites = [
        {
            id: member.id,
            allow: [
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.MoveMembers,
                PermissionFlagsBits.MuteMembers,
                PermissionFlagsBits.DeafenMembers,
                PermissionFlagsBits.Connect,
                PermissionFlagsBits.Speak,
            ],
        },
        {
            id: guild.roles.everyone.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
        },
    ]

    const channelName = `${member.user.username}'s Room`

    const newChannel = await newState.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildVoice,
        parent: newState.channel?.parent?.id,
        userLimit: 5,
        permissionOverwrites,
    })

    registerTempChannel(newChannel)

    await member.voice.setChannel(newChannel)

    return newChannel
}
