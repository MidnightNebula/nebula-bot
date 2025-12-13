import { handleVoiceCreate } from "@/features/room-handling/autovoice/create"
import { deleteEmpty } from "@/features/room-handling/autovoice/deleteEmptyVoice"

export function featureRoomHandler() {
    handleVoiceCreate()
    deleteEmpty()
}
