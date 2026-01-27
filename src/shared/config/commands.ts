export interface CommandDefinition {
    name: string;
    description: string;
}

export const commands = {
    pingvc: { name: "pingvc", description: "ping everyone in current vc" },
} as const satisfies Record<string, CommandDefinition>;

export type CommandType = keyof typeof commands;