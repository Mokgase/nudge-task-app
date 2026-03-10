// src/firebase/tasksService.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from './config';

const TASKS_COLLECTION = 'tasks';

export function subscribeToTasks(userId, callback) {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(tasks);
  });
}

export async function addTask(userId, taskData) {
  return addDoc(collection(db, TASKS_COLLECTION), {
    userId,
    ...taskData,
    createdAt: serverTimestamp(),
    completed: false,
    completedAt: null,
    timeSpentSeconds: 0,
    timerRunning: false
  });
}

export async function updateTask(taskId, updates) {
  return updateDoc(doc(db, TASKS_COLLECTION, taskId), updates);
}

export async function deleteTask(taskId) {
  return deleteDoc(doc(db, TASKS_COLLECTION, taskId));
}

export async function completeTask(taskId, timeSpentSeconds) {
  return updateDoc(doc(db, TASKS_COLLECTION, taskId), {
    completed: true,
    completedAt: serverTimestamp(),
    timeSpentSeconds,
    timerRunning: false
  });
}
