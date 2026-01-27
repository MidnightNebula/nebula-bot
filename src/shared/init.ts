import { Events, REST, Routes } from 'discord.js';

import { client } from '@/shared/config/client';
import { commands } from '@/shared/config/commands';
import { ENV } from '@/shared/config/env';

export async function initCommands() {
    const { pingvc } = commands
    const body = [pingvc]
    const rest = new REST({ version: '10' }).setToken(ENV.TOKEN);

    try {
        await rest.put(Routes.applicationGuildCommands(ENV.CLIENT_ID, ENV.GUILD_ID), { body }
        );
        console.log('✅ Registered commands:', body.map(c => c.name));
    } catch (error) {
        console.error('❌ Failed to register:', error);
    }
}


export async function initServer() {
    client.once(Events.ClientReady, readyClient => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`)
    })

    await client.login(process.env.TOKEN)
}