import 'dotenv/config'
import { Events } from 'discord.js'
import * as process from 'node:process'

import { handleMonitoring } from '@/external/monitoring'
import { featureLogging } from '@/features/logging'
import { featureAutoRole } from '@/features/moderation'
import { featureRoomHandler } from '@/features/room-handling'
import { validateEnvVars } from '@/shared/config/env'
import { client } from '@/shared/consts/client'

validateEnvVars()

featureLogging()
featureAutoRole()
featureRoomHandler()

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

await client.login(process.env.TOKEN)

handleMonitoring()
