import type { CommandInteraction, InteractionResponse } from "discord.js";

import { type CacheType, Events } from "discord.js";

import { client } from "@/shared/config/client";
import { type CommandType, commands } from "@/shared/config/commands";


export function interactionCreateEvent(
    handler: (interaction: CommandInteraction<CacheType>) => Promise<InteractionResponse<boolean>>,
    commandType: CommandType
) {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === commands[commandType].name) {
            await handler(interaction);
        }
    });
}