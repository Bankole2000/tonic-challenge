import { SocketConnection } from '../../lib/socketIO';
import UserDBService from '../../services/v1/user.service';

const userService = new UserDBService();

export const USER_CONNECTED_HANDLER = async (data: any, socket: any, io: SocketConnection) => {
  const rooms = io.sockets.adapter.sids.get(socket.id);
  console.log({ oldRooms: rooms?.values() });
  Array.from(rooms as Set<string>).forEach(async (room: string) => {
    if (room !== socket.id) {
      await socket.leave(room);
    }
  });
  const { data: user } = await userService.findUserById(data.userId);
  if (user) {
    await socket.join(user.id);
    return true;
  }
  return null;
};
