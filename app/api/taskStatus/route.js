// pages/api/taskStatus.js
import { NextResponse } from 'next/server';
import { getTaskById } from '/lib/tasks';

/**
 *
 * @param req
 * @returns {Promise<NextResponse<{error: string}>|NextResponse<*>>}
 * @description 작업 ID를 받아서 해당 작업의 상태와 결과를 반환합니다.
 */

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    console.log('Received taskId:', taskId);

    const task = getTaskById(taskId);

    if (!taskId || !task) {
        console.log('Invalid or missing taskId', taskId, task);
        return NextResponse.json({ error: 'Invalid or missing taskId' }, { status: 400 });
    }

    console.log('Task found:', task);
    return NextResponse.json(task, { status: 200 });
}