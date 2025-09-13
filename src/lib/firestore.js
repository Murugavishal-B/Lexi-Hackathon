// src/lib/firestore.js
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

export const saveMessage = async (userId, message) => {
  try {
    await addDoc(collection(db, "users", userId, "chats"), {
      ...message,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("saveMessage error:", err);
  }
};

export const loadMessages = async (userId) => {
  try {
    const q = query(collection(db, "users", userId, "chats"), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("loadMessages error:", err);
    return [];
  }
};
