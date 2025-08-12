const prisma = require("./prisma");
const { Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");


async function main() {
  // ... you will write your Prisma Client queries here
  await prisma.user.deleteMany();
  const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 10);
  await prisma.user.create({
    data: {
      role: Role.ADMIN,
      username: "psughra@uwaterloo.ca",
      password: hashedPassword,
    }
  });
  await prisma.user.create({
    data: {
      role: Role.USER,
      username: "prabhnoor.ughra@gmail.com",
      password: hashedPassword,
    }
  });
  const users = await prisma.user.findMany();
  console.log(users);
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