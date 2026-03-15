export const ENV = {
    TOKEN: process.env.TOKEN!,
    LOG_CHANNEL_ID: process.env.LOG_CHANNEL_ID!,
    CLIENT_ID: process.env.CLIENT_ID!,
    GUILD_ID: process.env.GUILD_ID!,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
} as const

export function validateEnvVars() {
    const missingVars = Object.entries(ENV)
        .filter(([key]) => !process.env[key])
        .map(([key]) => key)

    if (missingVars.length > 0) {
        console.error(`Missing required environment variables: ${missingVars.join(', ')}`)
        process.exit(1)
    }
}

export const logChannelId = ENV.LOG_CHANNEL_ID
