import { NextResponse } from 'next/server';
import { tasks } from '../startScrape/route';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    console.log('taskId',taskId)

    if (!taskId || !tasks[taskId]) {
        return NextResponse.json({ error: 'Invalid or missing taskId' }, { status: 400 });
    }

    return NextResponse.json(tasks[taskId], { status: 200 });
}