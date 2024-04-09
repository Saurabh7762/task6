import React, { useState } from "react";
import {
  getDocs,
  getDoc,
  doc,
  query,
  where,
  addDoc,
  collection,
} from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";

function Test(user) {
  const [todolistname, setTodolistname] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const todolistRef = collection(db, `todosof ${user.uid}`);
          const todolistQuery = query(
            todolistRef,
            where("todolistname", "==", todolistname)
          );
          const todolistSnapshot = await getDocs(todolistQuery);

          if (todolistSnapshot.empty) {
            // No matching todolist found, create a new one
            const newTodolistRef = await addDoc(todolistRef, {
              todolistname: todolistname,
            });

            // Add title, description, and date to the new todolist
            await addDoc(collection(db, newTodolistRef.path, "tasks"), {
              title: title,
              description: description,
              date: date,
            });
          } else {
            // Todolist with the same name exists
            todolistSnapshot.forEach(async (doc) => {
              // Add title, description, and date to the existing todolist
              await addDoc(collection(db, doc.ref.path, "tasks"), {
                title: title,
                description: description,
                date: date,
              });
            });
          }
        } else {
          console.log("User is not signed in to add todo to database");
        }
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Todo List Name"
        value={todolistname}
        onChange={(e) => setTodolistname(e.target.value)}
      />
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button type="submit">Add Todo</button>
    </form>
  );
}

export default Test;
