const prisma = require("./prisma");
const { Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");


async function main() {
  // ... you will write your Prisma Client queries here
  const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 10);
  /* await prisma.user.create({
    data: {
      role: Role.ADMIN,
      username: process.env.USERNAME,
      password: hashedPassword,
    }
  });

  await prisma.pageViewCounter.create({
    data: {
      key: "/"
    }
  }); */
  
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })