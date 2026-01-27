import 'dotenv/config'

import { handleMonitoring } from '@/external/monitoring'
import { featureLogging } from '@/features/logging'
import { featureAutoRole } from '@/features/moderation'
import { featureRoomHandler } from '@/features/room-handling'
import { validateEnvVars } from '@/shared/config/env'
import { initCommands, initServer } from '@/shared/init'

validateEnvVars()

featureLogging()
featureAutoRole()
featureRoomHandler()

await initCommands()
await initServer()

handleMonitoring()
