import { Users, Roles } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { unauthenticated, unauthorizedSuper } from '../../utils/authorization.error';
import { ResolverContext } from '../../utils/typeContext';
import { existUser, isUsers } from './utils/errors.users';

export async function createUser(
  parent: unknown,
  {
    data,
  }: {
    data: Users;
  },
  context: ResolverContext
): Promise<Users | undefined> {
  const { nickname, password, profilePicture, status, email,roleId } = data;

  const hashPassword = await bcrypt.hash(password, 10);
  const user = await context.orm.users.findUnique({
    where: { nickname: nickname },
  });
  existUser(user, nickname);
  return await context.orm.users.create({
    data: {
      nickname,
      password: hashPassword,
      profilePicture,
      status,
      email,
      role: {
        connect: {
          id: roleId,
        },
      },
    },
    include: {
      role: true,
    },
  });

}

export async function updateUser(
  parent: unknown,
  arg: {
    id: string;
    data: Users;
  },
  context: ResolverContext
): Promise<Users | undefined> {
  unauthenticated();
  const { nickname, profilePicture, status, email,roleId } = arg.data;
  let user = await context.orm.users.findUnique({
    where: { id: parseInt(arg.id, 10) },
  });
  isUsers(user, arg.id);
  if (nickname) {
    user = await context.orm.users.findUnique({
      where: { nickname: nickname },
    });
    existUser(user, nickname);
    return context.orm.users.update({
      where: { id: parseInt(arg.id, 10) },
      data: {
        nickname: nickname,
        profilePicture: profilePicture,
        status: status,
        email: email,
        role: {
          connect: {
            id: roleId,
          },
        },
      },
      include: {
        role: true
      }
    });
  }
  return context.orm.users.update({
    where: { id: parseInt(arg.id, 10) },
    data: {
      nickname: nickname,
      profilePicture: profilePicture,
      status: status,
      email: email,
      role: {
        connect: {
          id: roleId,
        },
      },
    },
    include: {
      role: true
    }
  });
}

export async function deleteAnUser(
  paren: unknown,
  arg: { id: string },
  context: ResolverContext
) {
  unauthenticated();
  unauthorizedSuper();
  const user = await context.orm.users.findUnique({
    where: { id: parseInt(arg.id, 10) },
  });
  isUsers(user, arg.id);
  await context.orm.users.delete({
    where: { id: parseInt(arg.id, 10) },
  });
  return `The User with the ${arg.id} was deleted.`;
}

export const resolver: Record<
  keyof (Users & { role: Roles }),
  (parent: Users & { role: Roles }) => unknown
> = {
  id: (parent) => parent.id,
  createdAt: (parent) => parent.createdAt,
  updatedAt: (parent) => parent.updatedAt,
  nickname: (parent) => parent.nickname,
  password: (parent) => parent.password,
  email: (parent) => parent.email,
  profilePicture: (parent) => parent.profilePicture,
  status: (parent) => parent.status,
  roleId: (parent) => parent.role.id,
  role: (parent) => ({
    id: parent.role.id,
    name: parent.role.name,
    status: parent.role.status,
  }),
};
