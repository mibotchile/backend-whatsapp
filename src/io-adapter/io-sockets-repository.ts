import { Socket } from 'socket.io'
import { User } from 'src/user/user.entity'
interface SocketClient {
    id:string,
    user:User,
    projectUid:string,
    socket:Socket
}
export class IoSocketsRepository {
  public static socketClients:SocketClient[] = []

  static findByUserEmail(email:string):SocketClient {
    return this.socketClients.find(sc => sc.user.email === email)
  }

  static findByProjectUid(projectUid:string):SocketClient[] {
    return this.socketClients.filter(sc => sc.projectUid === projectUid)
  }

  static findGroupId(groupId:number):SocketClient[] {
    return this.socketClients.filter(sc => sc.user.groups_id.includes(groupId))
  }

  static findUserId(userId:number):SocketClient {
    return this.socketClients.find(sc => sc.user.id === userId)
  }
}
