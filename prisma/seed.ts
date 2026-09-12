import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import AppTextDefault from '../src/routes/DTunnel/AppText/defaults';

const prisma = new PrismaClient();

const DEFAULT_USERNAME = 'DTunnelPro';
const DEFAULT_PASSWORD = '123456';
const DEFAULT_EMAIL = 'dtunnel-pro@dtunnel.local';

const DEFAULT_PACKAGES = [
  { name: 'Demo 1 Día', days: 1 },
  { name: '1 Mes', days: 31 },
  { name: '3 Meses', days: 93 },
  { name: '6 Meses', days: 186 },
  { name: '12 Meses', days: 372 },
];

// El panel no tiene registro de usuarios: solo existe este usuario predeterminado (rol ADMIN).
async function main() {
  const packagesCount = await prisma.package.count();
  if (packagesCount === 0) {
    await prisma.package.createMany({ data: DEFAULT_PACKAGES });
  }

  const existingUser = await prisma.user.findFirst();
  if (existingUser) return;

  const user = await prisma.user.create({
    data: {
      username: DEFAULT_USERNAME,
      email: DEFAULT_EMAIL,
      password: bcrypt.hashSync(DEFAULT_PASSWORD, 10),
      role: 'ADMIN',
    },
  });

  for (const appText of AppTextDefault) {
    await prisma.appText.create({
      data: {
        user_id: user.id,
        label: appText.label,
        text: appText.text,
      },
    });
  }

  console.log(`Usuario predeterminado creado -> usuario: ${DEFAULT_USERNAME} | contraseña: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
