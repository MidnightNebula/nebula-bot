import { commandsEvent } from '@/shared/lib/commands'

import { createTempVCEvent } from './auto-create-voice'
import { deleteEmptyTempVCEvent } from './auto-create-voice/deleteEmptyVoice'
import { pingCommands } from './ping-current-voice'

export function featureRoomHandler() {
    createTempVCEvent()
    deleteEmptyTempVCEvent()
    commandsEvent(pingCommands)
}
