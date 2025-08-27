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

async function getAllApplications(skip = 0, take = 25, emailConsent = null, studyYear = null) {
    if(studyYear && !validStudy(studyYear)) {
        studyYear = null;
    }
    if(typeof(emailConsent) != "boolean") {
        emailConsent = null;
    }
    const where = {
        ...(emailConsent != null && { emailConsent }),
        ...(studyYear != null && { studyYear }),
    };
    const applications = await prisma.application.findMany({
        where,
        skip,
        take,
        orderBy: {
            submittedAt: "desc"
        },
    });
    const total = await prisma.application.count({
        where,
    });
    return {applications, total};
}

function validStudy(studyYear) {
    return  studyYear === "First" ||
            studyYear === "Second" ||
            studyYear === "Third" ||
            studyYear === "Fourth" ||
            studyYear === "Fifth+";
}

async function searchApplications(query, skip = 0, take = 25, emailConsent = null, studyYear = null) {
    if(studyYear && !validStudy(studyYear)) {
        studyYear = null;
    }
    if(typeof(emailConsent) != "boolean") {
        emailConsent = null;
    }
    const where = {
        OR: [
            { email:     { contains: query, mode: 'insensitive' } },
            { studentId: { contains: query } },
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName:  { contains: query, mode: 'insensitive' } },
            { fullName:  { contains: query, mode: 'insensitive' } },
        ],
        ...(emailConsent != null && { emailConsent }),
        ...(studyYear != null && { studyYear }),
    };

    const applications = await prisma.application.findMany({
        where,
        skip,
        take,
        orderBy: {
            submittedAt: "desc"
        },
    });
    const total = await prisma.application.count({
      where,
    });

    return {applications, total};
}

async function getTotalApplicantCount() {
    const count = await prisma.application.count();
    return count;
}


async function getPageViews(key) {
    const data = await prisma.pageViewCounter.findUnique({
        where: {key}
    });
    return data.count;
}

async function viewPage(key) {
    await prisma.pageViewCounter.update({
        where: {
            key
        },
        data: {
            count: {
                increment: 1
            }
        }
    });
    return;
}


module.exports = {
    findUser,
    insertUser,
    findByEmail,
    findByStudentId,
    getAllApplications,
    insertApplication,
    getTotalApplicantCount,
    searchApplications,
    viewPage,
    getPageViews
}