import 'dotenv/config'

import { handleMonitoring } from '@/external/monitoring'
import { featureAi } from '@/features/ai'
import { featureLogging } from '@/features/logging'
import { featureModeration } from '@/features/moderation'
import { featureRoomHandler } from '@/features/room-handling'
import { validateEnvVars } from '@/shared/config/env'
import { initCommands, initServer } from '@/shared/init'

validateEnvVars()

featureLogging()
featureModeration()
featureRoomHandler()
featureAi()

await initServer()
await initCommands()

handleMonitoring()
