const { get } = require("../routes/indexRouter");
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


async function insertApplication(email, studentId, firstName, lastName, emailConsent, 
    program, studyYear, fullName) {
    const applicant = await prisma.application.create({
        data: {
            email,
            studentId,
            firstName,
            lastName,
            emailConsent,
            program,
            studyYear,
            fullName,
        }
    });
    return applicant;
};

async function findByEmail(email) {
   const applicant = await prisma.application.findUnique({
    where: {
        email: email,
    }
   });
    return applicant;
}

async function findByStudentId(studentId) {
   const applicant = await prisma.application.findUnique({
    where: {
        studentId: studentId,
    }
   });
    return applicant;
}

async function getAllApplications() {
    const apps = await prisma.application.findMany();
    return apps;
}

async function searchApplications(query) {
    const results = await prisma.application.findMany({
        where: {
            OR: [
                { email:     { contains: query, mode: 'insensitive' } },
                { studentId: { contains: query } },
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName:  { contains: query, mode: 'insensitive' } },
                { fullName:  { contains: query, mode: 'insensitive' } },
            ],
        }
    });
    return results;
}

async function getApplicantCount() {
    const count = await prisma.application.count();
    return count;
}


module.exports = {
    findUser,
    insertUser,
    findByEmail,
    findByStudentId,
    getAllApplications,
    insertApplication,
    getApplicantCount,
    searchApplications,
}