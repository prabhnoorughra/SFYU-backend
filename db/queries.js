const prisma = require("./prisma");


async function findUser(username) {
   const user = await prisma.user.findUnique({
    where: {
        username: username,
    }
   });
    return user;
}

async function insertUser(username, password) {
    const user = await prisma.user.create({
        data: {
            username: username,
            password: password,
        }
    });
    return user;
};
module.exports = {
    findUser,
    insertUser,
}