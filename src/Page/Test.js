import React, { useState, useEffect } from "react";
import {
  getDocs,
  doc,
  query,
  where,
  addDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";
import UserProfile from "./Components/UserProfile";
import "./Style/Test.css";

function Test(user) {
  const [todolistname, setTodolistname] = useState("");
  const [newTodolistName, setNewTodolistName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [todolistOptions, setTodolistOptions] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  const handleTodoListChange = (e) => {
    const selectedValue = e.target.value;
    setTodolistname(selectedValue);

    // Clear newTodolistName if an existing todo list is selected
    if (selectedValue !== "addNew") {
      setNewTodolistName("");
    }
  };

  const handleNewTodoListNameChange = (e) => {
    setNewTodolistName(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log("User is not signed in to fetch todo lists");
          return;
        }

        const userRef = doc(db, "Users", user.uid);
        const q = query(collection(userRef, "todolists"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const options = [];
          snapshot.forEach((doc) => {
            options.push(doc.data().name);
          });
          setTodolistOptions(options);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching todo lists:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const selectedTodoListName = newTodolistName || todolistname;

          if (
            !selectedTodoListName ||
            selectedTodoListName === "Select Todo List"
          ) {
            console.log("Please select a todo list.");
            return;
          }

          const userRef = doc(db, "Users", user.uid);
          const todolistQuery = query(
            collection(userRef, "todolists"),
            where("name", "==", selectedTodoListName)
          );
          const todolistSnapshot = await getDocs(todolistQuery);

          if (todolistSnapshot.empty && newTodolistName) {
            const newTodolistRef = await addDoc(
              collection(userRef, "todolists"),
              {
                name: newTodolistName,
              }
            );

            await addDoc(collection(newTodolistRef, "tasks"), {
              title: title,
              description: description,
              date: date,
              priority: priority,
            });
          } else if (!todolistSnapshot.empty) {
            todolistSnapshot.forEach(async (doc) => {
              await addDoc(collection(doc.ref, "tasks"), {
                title: title,
                description: description,
                date: date,
                priority: priority,
              });
            });
          }
          setTodolistname("");
          setNewTodolistName("");
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
        <select
          value={todolistname}
          onChange={handleTodoListChange}
          className="input"
          required // Make the select field required
        >
          <option value="" disabled>
            Select Todo List
          </option>
          {todolistOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
          <option value="addNew">Add New</option>
        </select>
        {todolistname === "addNew" && (
          <input
            type="text"
            placeholder="Enter New Todo List Name"
            value={newTodolistName}
            onChange={handleNewTodoListNameChange}
            className="input"
            required // Make the input field required
          />
        )}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required // Make the input field required
          className="input"
        />
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          required // Make the input field required
          className="input"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          required // Make the select field required
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
          required // Make the textarea field required
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
