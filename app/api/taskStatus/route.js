// pages/api/taskStatus.js
import { NextResponse } from 'next/server';
import { getTaskById } from '/lib/tasks';

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