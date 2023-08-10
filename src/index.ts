import { Prisma } from "@prisma/client/extension";

const paginate = Prisma.defineExtension({
  name: "prisma-extension-paginate",
  model: {
    $allModels: {
      async findManyPaginated<T, A>(
        this: T,
        args: Prisma.Exact<A, Prisma.Args<T, "findMany">> & {
          page?: number;
          take?: never;
          skip?: never;
          limit?: number;
        }
      ): Promise<{
        data: Prisma.Result<T, A, "findMany">;
        meta: {
          total: number;
          lastPage: number;
          currentPage: number;
          limit: number;
          prev: number | null;
          next: number | null;
        };
      }> {
        // @ts-expect-error
        const { page = 1, limit = 10, ...rest } = args;
        const ctx = Prisma.getExtensionContext(this);

        const skip = page > 0 ? limit * (page - 1) : 0;
        const [total, data] = await Promise.all([
          // @ts-expect-error
          ctx.count(
            // @ts-expect-error
            args.where
              ? {
                  // @ts-expect-error
                  where: args.where,
                }
              : {}
          ),
          // @ts-expect-error
          ctx.findMany({
            ...rest,
            take: limit,
            skip,
          }),
        ]);
        const lastPage = Math.ceil(total / limit);

        return {
          data,
          meta: {
            total,
            lastPage,
            currentPage: page,
            limit,
            prev: page > 1 ? page - 1 : null,
            next: page < lastPage ? page + 1 : null,
          },
        };
      },
    },
  },
});

export default paginate;
