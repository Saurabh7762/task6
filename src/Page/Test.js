import React, { useState } from "react";
import {
  getDocs,
  doc,
  query,
  where,
  addDoc,
  collection,
} from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";
import UserProfile from "./UserProfile";

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
          const userRef = doc(db, "Users", user.uid);
          const todolistQuery = query(collection(userRef, "todolists"), where("name", "==", todolistname));
          const todolistSnapshot = await getDocs(todolistQuery);

          if (todolistSnapshot.empty) {
            // No matching todolist found, create a new one
            const newTodolistRef = await addDoc(collection(userRef, "todolists"), {
              name: todolistname
            });

            // Add title, description, and date to the new todolist
            await addDoc(collection(newTodolistRef, "tasks"), {
              title: title,
              description: description,
              date: date
            });
          } else {
            // Todolist with the same name exists
            todolistSnapshot.forEach(async (doc) => {
              // Add title, description, and date to the existing todolist
              await addDoc(collection(doc.ref, "tasks"), {
                title: title,
                description: description,
                date: date
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
    <>
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
      <br />
      <div>
        <UserProfile/>
      </div>
    </>
  );
};
export default Test;
