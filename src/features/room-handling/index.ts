import { commands } from "@/shared/config/commands"
import { interactionCreateEvent } from "@/shared/lib/interaction-create"

import { createTempVC } from "./auto-create-voice/create"
import { deleteEmptyTempVC } from "./auto-create-voice/deleteEmptyVoice"
import { pingCurrentVC } from "./ping-current-voice"

export function featureRoomHandler() {
    createTempVC()
    deleteEmptyTempVC()
    interactionCreateEvent(pingCurrentVC, commands.pingvc.name)
}
