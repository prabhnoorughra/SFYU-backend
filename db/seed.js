const prisma = require("./prisma");


async function main() {
  // ... you will write your Prisma Client queries here
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