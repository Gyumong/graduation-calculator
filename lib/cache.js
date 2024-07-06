
const tasks = {};

export const getTasks = () => tasks;

export const getTaskById = (taskId) => tasks[taskId];

export const setTask = (taskId, task) => {
    tasks[taskId] = task;
};