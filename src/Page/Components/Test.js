import React, { useState } from "react";
import {
  getDocs,
  doc,
  query,
  where,
  addDoc,
  collection,
} from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";
import UserProfile from "../UserProfile";
import "../Style/Test.css";

function Test(user) {
  const [todolistname, setTodolistname] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState("Medium"); // Default priority set to Medium

  // Get today's date in the format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const userRef = doc(db, "Users", user.uid);
          const todolistQuery = query(
            collection(userRef, "todolists"),
            where("name", "==", todolistname)
          );
          const todolistSnapshot = await getDocs(todolistQuery);

          if (todolistSnapshot.empty) {
            // No matching todolist found, create a new one
            const newTodolistRef = await addDoc(
              collection(userRef, "todolists"),
              {
                name: todolistname,
              }
            );

            // Add title, description, date, and priority to the new todolist
            await addDoc(collection(newTodolistRef, "tasks"), {
              title: title,
              description: description,
              date: date,
              priority: priority,
            });
          } else {
            // Todolist with the same name exists
            todolistSnapshot.forEach(async (doc) => {
              // Add title, description, date, and priority to the existing todolist
              await addDoc(collection(doc.ref, "tasks"), {
                title: title,
                description: description,
                date: date,
                priority: priority,
              });
            });
          }
          // Clear all fields after successful submission
          setTodolistname("");
          setTitle("");
          setDescription("");
          setDate("");
          setPriority("Medium");
        } else {
          console.log("User is not signed in to add todo to database");
        }
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Todo List Name"
          value={todolistname}
          onChange={(e) => setTodolistname(e.target.value)}
          required // Making the field required
          className="input"
        />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required // Making the field required
          className="input"
        />
        <input
          type="date"
          value={date}
          min={today} // Set minimum date to today's date
          onChange={(e) => setDate(e.target.value)}
          required // Making the field required
          className="input"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          required // Making the field required
          className="select"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required // Making the field required
          className="textarea"
        ></textarea>
        <button type="submit" className="button">
          Add Todo
        </button>
      </form>
      <br />
      <div>
        <UserProfile />
      </div>
    </div>
  );
}
export default Test;
