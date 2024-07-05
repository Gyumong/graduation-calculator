import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { execFile } from 'child_process';
import path from 'path';

const tasks = {};

export async function POST(req) {
    const { username, password } = await req.json();

    if (!username || !password) {
        return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const taskId = uuidv4();
    tasks[taskId] = { status: 'in-progress', data: null };

    const scriptPath = path.resolve('scrape_suwon_portal.py');
    console.log(`Executing script: ${scriptPath}`);

    execFile('python3', [scriptPath, username, password], (error, stdout, stderr) => {
        if (error) {
            console.error('Exec error:', error);
            tasks[taskId] = { status: 'failed', data: null };
            return;
        }
        if (stderr) {
            console.error('Stderr:', stderr);
            tasks[taskId] = { status: 'failed', data: null };
            return;
        }

        try {
            console.log('Stdout:', stdout);
            const data = JSON.parse(stdout);

            // 학기별로 데이터 그룹화
            const groupedData = data.reduce((acc, item) => {
                const key = item.subjtEstbYearSmr;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push({
                    subjectEstablishmentYear: item.subjtEstbYear,
                    studentNumber: item.sno,
                    courseNumber: item.diclNo,
                    scheduleSummary: item.timtSmryCn,
                    departmentName: item.estbDpmjNm,
                    courseName: item.subjtNm,
                    retakeYearSemester: item.refacYearSmr,
                    isClosed: item.closeYn,
                    facultyDivisionCode: item.facDvcd,
                    points: item.point,
                    professorName: item.ltrPrfsNm,
                    subjectEstablishmentYearSemester: item.subjtEstbYearSmr,
                    subjectEstablishmentSemesterCode: item.subjtEstbSmrCd,
                    facultyDivisionName: item.facDvnm,
                    subjectCode: item.subjtCd
                });
                return acc;
            }, {});

            const formattedData = Object.keys(groupedData).map(key => ({
                semester: key,
                courses: groupedData[key]
            }));

            tasks[taskId] = { status: 'completed', data: formattedData };
        } catch (parseError) {
            console.error('Parse error:', parseError);
            tasks[taskId] = { status: 'failed', data: null };
        }
    });

    return NextResponse.json({ taskId }, { status: 202 });
}

export { tasks };