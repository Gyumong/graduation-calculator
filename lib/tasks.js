import fs from 'fs';
import path from 'path';

const tasksFilePath = path.resolve(process.cwd(), 'tasks.json');

// Helper function to read tasks from the file
const readTasksFromFile = () => {
    try {
        const data = fs.readFileSync(tasksFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
};

// Helper function to write tasks to the file
const writeTasksToFile = (tasks) => {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
};

export const getTaskById = (taskId) => {
    const tasks = readTasksFromFile();
    return tasks[taskId];
};

export const setTask = (taskId, taskData) => {
    const tasks = readTasksFromFile();
    tasks[taskId] = taskData;
    writeTasksToFile(tasks);
};

export const getTasks = () => {
    return readTasksFromFile();
};