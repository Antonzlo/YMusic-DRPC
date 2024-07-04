import { Socket } from 'socket.io-client'

export default interface UserInterface {
    id: string
    username: string
    avatar: string
    banner: string
    perms: string
    badges: any[]
}
