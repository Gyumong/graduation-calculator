// pages/api/startScrape.js
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { execFile } from 'child_process';
import path from 'path';
import { setTask, getTasks } from '/lib/tasks'

/**
 *
 * @param req
 * @returns {Promise<NextResponse<{error: string}>|NextResponse<{taskId: (`${string}-${string}-${string}-${string}-${string}`|*|string)}>>}
 * @description 사용자가 제공한 학번과 비밀번호를 받아서 포털 사이트에서 강의 정보를 크롤링하고, 작업 ID를 반환합니다.
 *
 */

export async function POST(req) {
    const { username, password } = await req.json();

    if (!username || !password) {
        return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const taskId = uuidv4();
    setTask(taskId, { status: 'in-progress', data: null });
    console.log('@@tasks', getTasks());

    const scriptPath = path.resolve('scrape_suwon_portal.py');
    console.log(`Executing script: ${scriptPath}`);

    execFile('python3', [scriptPath, username, password], (error, stdout, stderr) => {
        if (error) {
            console.error('Exec error:', error);
            setTask(taskId, { status: 'failed', data: null });
            return;
        }
        if (stderr) {
            console.error('Stderr:', stderr);
            setTask(taskId, { status: 'failed', data: null });
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

            setTask(taskId, { status: 'completed', data: formattedData });
        } catch (parseError) {
            console.error('Parse error:', parseError);
            setTask(taskId, { status: 'failed', data: null });
        }
    });

    return NextResponse.json({ taskId }, { status: 202 });
}