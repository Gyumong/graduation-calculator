// __tests__/api.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

let server;

beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(3000);
});

afterAll(() => {
    server.close();
    // Clean up the tasks file after tests
    const tasksFilePath = path.resolve(process.cwd(), 'tasks.json');
    fs.unlinkSync(tasksFilePath);
});

describe('API Tests', () => {
    let taskId;

    it('should create a task and return task ID', async () => {
        const response = await request(server)
            .post('/api/startScrape')
            .send({ username: process.env.USERID, password: process.env.USERPASSWORD })
            .expect(202);

        taskId = response.body.taskId;
        console.log('Generated Task ID:', taskId); // 로그 추가
        expect(taskId).toBeDefined();
    });

    it('should return task status and data', async () => {
        // Ensure the task has time to complete
        await new Promise(resolve => setTimeout(resolve, 10000)); // 적절한 지연 시간 조정

        const response = await request(server)
            .get(`/api/taskStatus?taskId=${taskId}`)
            .expect(200);

        const data = response.body;
        expect(data.status).toBe('completed');
        expect(data.data).toBeInstanceOf(Array);
    }, 20000); // 20 seconds timeout for this test
});