import { Directors } from '@prisma/client';
import { ResolverContext } from '../../utils/typeContext';
import { existDirector, isDirector } from './utils/errors.directors';
import { unauthenticated, unauthorizedAdmin } from '../../utils/authorization.error';

export async function createDirector(
  parent: unknown,
  { data }: { data: Pick<Directors, 'name'> },
  context: ResolverContext
): Promise<Directors | undefined> {
  unauthenticated();
  unauthorizedAdmin();
  const director = await context.orm.directors.findUnique({
    where: { name: data.name },
  });
  existDirector(director, data.name);
  return await context.orm.directors.create({
    data,
  });
}

export async function updateDirector(
  parent: unknown,
  arg: { id: string; data: Directors },
  context: ResolverContext
): Promise<Directors | undefined> {
  unauthenticated();
  unauthorizedAdmin();
  let director = await context.orm.directors.findUnique({
    where: { id: parseInt(arg.id, 10) },
  });
  isDirector(director, arg);
  if (!arg.data.name) {
    return context.orm.directors.update({
      where: { id: parseInt(arg.id, 10) },
      data: {
        status: arg.data.status,
      },
    });
  }
  director = await context.orm.directors.findUnique({
    where: { name: arg.data.name },
  });
  existDirector(director, arg.data.name);

  return context.orm.directors.update({
    where: { id: parseInt(arg.id, 10) },
    data: {
      name: arg.data.name,
      status: arg.data.status
    },
  });
}

export async function deleteDierctor(
  parent: unknown,
  arg: { id: string },
  context: ResolverContext
) {
  unauthenticated();
  unauthorizedAdmin();
  const director = await context.orm.directors.findUnique({
    where: { id: parseInt(arg.id, 10) },
  });

  isDirector(director, arg);
  await context.orm.directors.delete({
    where: { id: parseInt(arg.id, 10) },
  });
  return `The Director with ${arg.id} Id was deleted`;
}
