import type { VoiceChannel } from 'discord.js'

export const tempChannels = new Set<string>()

export function registerTempChannel(channel: VoiceChannel) {
    tempChannels.add(channel.id)
    console.log(`Registered temp channel: ${channel.id}`)
}
