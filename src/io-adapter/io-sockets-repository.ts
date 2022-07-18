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

  static findByUserEmail(projectUid:string, email:string):SocketClient {
    return this.socketClients.find(sc => (sc.projectUid === projectUid && sc.user.email === email))
  }

  //   static findByProjectUid(projectUid:string):SocketClient[] {
  //     return this.socketClients.filter(sc => sc.projectUid === projectUid)
  //   }

  static findByGroupId(projectUid:string, groupId:number):SocketClient[] {
    return this.socketClients.filter(sc => (sc.projectUid === projectUid && sc.user.groups_id.includes(groupId)))
  }

  static findByUserId(projectUid:string, userId:number):SocketClient {
    return this.socketClients.find(sc => (sc.projectUid === projectUid && sc.user.id === userId))
  }
}
