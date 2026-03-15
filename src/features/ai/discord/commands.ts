import type { ChatInputCommandInteraction, CommandInteraction, GuildMember } from 'discord.js'

import {
    getVoiceConnection,
    joinVoiceChannel,
    entersState,
    VoiceConnectionStatus,
    createAudioPlayer,
} from '@discordjs/voice'
import { SlashCommandBuilder, type CacheType } from 'discord.js'

import {
    config,
    guildConnections,
    inititialMessageAngry,
    inititialMessageFriend,
    roles,
    type GuildConnectionState,
} from '@/features/ai/config'
import {
    initAiSession,
    sendInitMessageToAi,
    botAudioToAi,
    cleanupGuildConnection,
    clearAiSession,
    clearOutputStream,
} from '@/features/ai/gemini/core'
import { CommandType, type CommandHandler } from '@/shared/lib/commands'

export enum AiCommands {
    Join = 'ai-join',
    Leave = 'ai-leave',
    Reset = 'ai-reset',
    Roles = 'ai-roles',
    SetRole = 'ai-set-role',
    CurrentRole = 'ai-current-role',
}

export const aiCommandsREST = [
    new SlashCommandBuilder().setName(AiCommands.Join).setDescription('бот зайдет в войс'),
    new SlashCommandBuilder().setName(AiCommands.Leave).setDescription('бот выйдет из войса'),
    new SlashCommandBuilder().setName(AiCommands.Reset).setDescription('перезапустить контекст ии'),
    new SlashCommandBuilder().setName(AiCommands.Roles).setDescription('показать доступные роли'),
    new SlashCommandBuilder()
        .setName(AiCommands.SetRole)
        .setDescription('поменять роль')
        .addStringOption(option =>
            option
                .setName('role')
                .setDescription('выберите')
                .setRequired(true)
                .addChoices(
                    { name: 'друг', value: 'друг' },
                    { name: 'строгий учитель', value: 'строгий учитель' },
                    { name: 'пьяный сосед', value: 'пьяный сосед' },
                    { name: 'хитрый босс', value: 'хитрый босс' },
                    { name: 'циничный бармен', value: 'циничный бармен' },
                    { name: 'злая бабушка', value: 'злая бабушка' },
                    { name: 'уличный гангстер', value: 'уличный гангстер' },
                    { name: 'сноб-критик', value: 'сноб-критик' },
                    { name: 'бывшая подруга', value: 'бывшая подруга' },
                    { name: 'коррумпированный коп', value: 'коррумпированный коп' },
                ),
        ),

    new SlashCommandBuilder()
        .setName(AiCommands.CurrentRole)
        .setDescription('показать текущую роль'),
].map(c => c.toJSON())

export const aiCommands: Record<AiCommands, CommandHandler> = {
    [AiCommands.Join]: { type: CommandType.Base, handler: aiJoinCommand },
    [AiCommands.Leave]: { type: CommandType.Base, handler: aiLeaveCommand },
    [AiCommands.Reset]: { type: CommandType.Base, handler: aiResetCommand },
    [AiCommands.Roles]: { type: CommandType.Base, handler: aiRolesCommand },
    [AiCommands.SetRole]: { type: CommandType.Chat, handler: aiSetRoleCommand },
    [AiCommands.CurrentRole]: { type: CommandType.Base, handler: aiCurrentRoleCommand },
}

export async function aiJoinCommand(interaction: CommandInteraction<CacheType>) {
    const member = interaction.member as GuildMember
    const voiceChannel = member.voice.channel

    if (!voiceChannel) {
        return interaction.reply('Please join a voice channel first!')
    }

    const existing = getVoiceConnection(voiceChannel.guild.id)
    if (existing) {
        return interaction.reply('Already connected to a voice channel!')
    }

    try {
        const voiceConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
        })

        await entersState(voiceConnection, VoiceConnectionStatus.Ready, 30_000)

        const audioPlayer = createAudioPlayer()
        voiceConnection.subscribe(audioPlayer)

        const guildState: GuildConnectionState = {
            voiceConnection,
            audioPlayer,
            inputStream: new Map(),
            currentRoleIndex: 0,
        }

        guildConnections.set(voiceChannel.guild.id, guildState)

        audioPlayer.on('error', error => {
            console.error('Audio player error:', error)
        })

        await initAiSession(guildState)
        sendInitMessageToAi(guildState)
        botAudioToAi(guildState)

        await interaction.reply(`✅ Подключился к **${voiceChannel.name}** и слушаю вас!`)
    } catch (error) {
        console.error('Failed to join voice channel:', error)
        await interaction.reply('❌ Failed to join voice channel!')
    }
}

export async function aiLeaveCommand(interaction: CommandInteraction<CacheType>) {
    const guildId = interaction.guild?.id
    if (!guildId) return

    await cleanupGuildConnection(guildId, 'User requested leave')
    await interaction.reply('👋 Ушел отдыхать!')
}

export async function aiResetCommand(interaction: CommandInteraction<CacheType>) {
    const guildId = interaction.guild?.id
    if (!guildId) {
        return interaction.reply('No guild found!')
    }

    const guildState = guildConnections.get(guildId)
    if (!guildState) {
        return interaction.reply('Not connected to any voice channel!')
    }

    try {
        clearAiSession(guildState)
        clearOutputStream(guildState)
        guildState.audioPlayer.stop()
        await initAiSession(guildState)
        sendInitMessageToAi(guildState)

        await interaction.reply('🔄 Перезапуск ии агента выполнен!')
        console.log(`AI reset for guild ${guildId}`)
    } catch (error) {
        console.error('Failed to reset AI:', error)
        await interaction.reply('❌ Failed to reset AI!')
    }
}

export async function aiRolesCommand(interaction: CommandInteraction<CacheType>) {
    const rolesList = roles
        .map((role, index) => `**${index + 1}. ${role.name}**\n${role.description}`)
        .join('\n\n')
    const rolesEmbed = {
        title: '🎭 Доступные роли',
        description: `Выбери роли через \`/ai-set-role <role_name>\`\n\n${rolesList}`,
        color: 0x00ff00,
        footer: { text: 'User consented to all role tones' },
    }

    await interaction.reply({ embeds: [rolesEmbed] })
}

export async function aiSetRoleCommand(interaction: ChatInputCommandInteraction<CacheType>) {
    const guildId = interaction.guild?.id
    if (!guildId) {
        return interaction.reply('No guild found!')
    }

    const guildState = guildConnections.get(guildId)
    if (!guildState) {
        return interaction.reply('❌ Не подключен к войсу! Используй `/ai-join` сначала.')
    }

    const roleName = interaction.options.getString('role', true)
    const selectedRole = roles.find(role => role.name.toLowerCase() === roleName.toLowerCase())

    if (!selectedRole) {
        const availableRoles = roles.map(r => `\`${r.name}\``).join(', ')
        return interaction.reply(
            `❌ Роль "${roleName}" не найдена!\n\nДоступные роли: ${availableRoles}\nИспользуй \`/ai-roles\` чтобы посмотреть все.`,
        )
    }

    try {
        config.systemInstruction = {
            parts: [{ text: selectedRole.description }],
        }
        config.speechConfig = {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName: selectedRole.voiceName,
                },
            },
        }
        guildState.currentRoleIndex = roles.findIndex(r => r.name === selectedRole.name)

        clearAiSession(guildState)
        clearOutputStream(guildState)
        guildState.audioPlayer.stop()

        const session = await initAiSession(guildState)
        const initMessage = `Теперь ты ${selectedRole.name}. ${selectedRole.description.split('Тон:')[1]?.trim() || ''} 
        ${guildState.currentRoleIndex === 0 ? inititialMessageFriend : inititialMessageAngry}`

        session.sendClientContent({
            turns: initMessage,
        })

        const roleEmbed = {
            title: '🎭 Поменял роль успешно',
            description: `**Новая роль:** ${selectedRole.name}\n\n**Описание:** ${selectedRole.description}`,
            color: 0x00ff00,
            footer: { text: 'Ии теперь будет играть новую роль!' },
        }

        await interaction.reply({ embeds: [roleEmbed] })
        console.log(`Role changed to "${selectedRole.name}" for guild ${guildId}`)
    } catch (error) {
        console.error('Failed to set role:', error)
        await interaction.reply('❌ Failed to change AI role!')
    }
}

export async function aiCurrentRoleCommand(interaction: CommandInteraction<CacheType>) {
    const guildId = interaction.guild?.id
    if (!guildId) {
        return interaction.reply('No guild found!')
    }

    const guildState = guildConnections.get(guildId)
    if (!guildState) {
        return interaction.reply('❌ Бот не подключен к войсу! Используй `/ai-join`.')
    }

    const currentRole = roles[guildState.currentRoleIndex]
    const roleEmbed = {
        title: '🎭 Текущая ии роль',
        description: `**Роль:** ${currentRole.name}\n\n**Описание:** ${currentRole.description}`,
        color: 0x00ff00,
        footer: { text: 'Используй /ai-roles чтобы глянуть доступные' },
    }

    await interaction.reply({ embeds: [roleEmbed] })
}
