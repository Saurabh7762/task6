import React, { useState, useEffect } from "react";
import { auth, db } from "../FirebaseConfig";
import {
  collection,
  getDocs,
  getDoc,
  onSnapshot,
  doc,
} from "firebase/firestore";

const UserProfile = () => {
  const [userName, setUserName] = useState("");
  const [todolists, setTodolists] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, "Users", user.uid);

        // Fetch initial data
        const userDocSnapshot = await getDoc(userDocRef);
        const userData = userDocSnapshot.data();

        if (userData) {
          setUserName(userData.name);

          const todolistRef = collection(userDocRef, "todolists");

          // Use onSnapshot for real-time updates on todolists
          const todolistUnsubscribe = onSnapshot(
            todolistRef,
            async (todolistSnapshot) => {
              const promises = todolistSnapshot.docs.map(
                async (todolistDoc) => {
                  const todolistTasksRef = collection(todolistDoc.ref, "tasks");

                  // Use onSnapshot for real-time updates on tasks within each todolist
                  const tasksUnsubscribe = onSnapshot(
                    todolistTasksRef,
                    async (tasksSnapshot) => {
                      const todolistTasksData = tasksSnapshot.docs.map(
                        (taskDoc) => taskDoc.data()
                      );

                      // Update the todolist with the latest tasks
                      const todolistData = {
                        id: todolistDoc.id,
                        name: todolistDoc.data().name,
                        tasks: todolistTasksData,
                      };
                      setTodolists((prevTodolists) =>
                        prevTodolists.map((prevTodolist) =>
                          prevTodolist.id === todolistData.id
                            ? todolistData
                            : prevTodolist
                        )
                      );
                    }
                  );

                  return {
                    id: todolistDoc.id,
                    name: todolistDoc.data().name,
                    tasksUnsubscribe, // Store the unsubscribe function for each tasks snapshot
                  };
                }
              );

              // Wait for all promises to resolve
              const todolistData = await Promise.all(promises);
              setTodolists(todolistData);
            }
          );

          // Cleanup function to unsubscribe from all snapshots on unmount
          return () => {
            todolistUnsubscribe();
          };
        } else {
          console.log("User data not found.");
        }
      } else {
        console.log("User is not signed in.");
      }
    });

    // Cleanup function to unsubscribe from auth state changes on unmount
    return unsubscribe;
  }, []);

  return (
    <div>
      <h2>Welcome, {userName}</h2>
      <div>
        {todolists.map((todolist, index) => (
          <div key={index}>
            <h3>{todolist.name}</h3>
            <ul>
              {todolist.tasks &&
                Array.isArray(todolist.tasks) &&
                todolist.tasks.map((task, taskIndex) => (
                  <li key={taskIndex}>
                    <strong>{task.title}</strong> - {task.description} (
                    {task.date})
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;
