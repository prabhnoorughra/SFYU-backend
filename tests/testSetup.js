const prisma = require("../db/prisma");
const { Role } = require('@prisma/client');
const bcrypt = require("bcryptjs");


async function resetDB() {
    //clear database
    await prisma.pageViewCounter.deleteMany();
    await prisma.application.deleteMany();
    await prisma.user.deleteMany();
}


async function testSetup() {
    //create a USER and an ADMIN
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
    await prisma.pageViewCounter.create({
        data: {
          key: "/"
        }
      });
      
}


async function testTeardown() {
    await resetDB();
}

module.exports = { testSetup, testTeardown };