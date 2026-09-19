import prisma from '../../config/prisma-client';
import SafeCallback from '../../utils/safe-callback';
import { AppLayoutParserApi } from '../../utils/parsers/app-layout-parser';
import { AppLayoutDefault } from '../DTunnel/AppLayout/defaults';

export default async function GetAppLayout(user_id: string) {
  let AppLayout = await SafeCallback(() =>
    prisma.appLayout.findFirst({
      where: {
        user_id,
        is_active: true,
      },
      select: {
        user_id: true,
        layout_storage: {
          select: {
            id: true,
            name: true,
            label: true,
            type: true,
            value: true,
            status: true,
          },
        },
      },
    })
  );

  if (!AppLayout) {
    const userExists = await SafeCallback(() => prisma.user.findUnique({ where: { id: user_id } }));
    if (userExists) {
      const createAppLayout = await SafeCallback(() =>
        prisma.appLayout.create({
          data: {
            is_active: true,
            user_id,
          },
        })
      );

      if (createAppLayout) {
        for (const defaultItem of AppLayoutDefault) {
          await SafeCallback(() => {
            const value =
              typeof defaultItem.value === 'object' && defaultItem.type === 'SELECT'
                ? defaultItem.value?.selected
                : defaultItem.value;

            return prisma.appLayoutStorage.create({
              data: {
                label: defaultItem.label,
                name: defaultItem.name,
                status: defaultItem.status,
                type: defaultItem.type,
                value: String(value) === 'null' ? null : String(value),
                app_layout_id: createAppLayout.id,
              },
            });
          });
        }

        AppLayout = await SafeCallback(() =>
          prisma.appLayout.findFirst({
            where: {
              id: createAppLayout.id,
            },
            select: {
              user_id: true,
              layout_storage: {
                select: {
                  id: true,
                  name: true,
                  label: true,
                  type: true,
                  value: true,
                  status: true,
                },
              },
            },
          })
        );
      }
    }
  }

  return AppLayout ? AppLayoutParserApi(AppLayout) : [];
}
