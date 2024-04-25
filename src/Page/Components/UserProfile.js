import React, { useState, useEffect } from "react";
import { auth, db } from "../../FirebaseConfig";
import {
  collection,
  getDoc,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "../Style/UserProfile.css";

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
                        (taskDoc) => ({
                          id: taskDoc.id,
                          ...taskDoc.data(),
                        })
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

  const deleteTodolist = async (todolistId) => {
    try {
      await deleteDoc(
        doc(db, "Users", auth.currentUser.uid, "todolists", todolistId)
      );
    } catch (error) {
      console.error("Error deleting todolist: ", error);
    }
  };

  const sortTasksByPriority = (tasks) => {
    const sortedTasks = {
      High: [],
      Medium: [],
      Low: [],
    };

    tasks?.forEach((task) => {
      sortedTasks[task.priority]?.push(task);
    });

    return sortedTasks;
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error(error.message);
    }
  };

  
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const sourcePriority = source.droppableId;
    const destinationPriority = destination.droppableId;

    // If dropped in the same place, return
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Find the source and destination to-do list IDs
    const sourceToDoListId = sourcePriority.split("-")[1];
    const destinationToDoListId = destinationPriority.split("-")[1];

    // Find the task
    const taskIndex = todolists
      .find((todolist) => todolist.id === sourceToDoListId)
      .tasks.findIndex((task) => task.id === draggableId);

    // Get the task data
    const taskToUpdate = todolists.find(
      (todolist) => todolist.id === sourceToDoListId
    ).tasks[taskIndex];

    // Update the tasks list
    const updatedTodolists = [...todolists];

    // Remove the task from its original position
    updatedTodolists
      .find((todolist) => todolist.id === sourceToDoListId)
      .tasks.splice(taskIndex, 1);

    // Insert the task at the new position
    updatedTodolists
      .find((todolist) => todolist.id === destinationToDoListId)
      .tasks.splice(destination.index, 0, taskToUpdate);

    // Update the priority of the task based on its new position
    const newPriority = destinationPriority.split("-")[0];
    const updatedTask = { ...taskToUpdate, priority: newPriority };

    // Update state
    setTodolists(updatedTodolists);

    try {
      const sourceTaskDocRef = doc(
        db,
        "Users",
        auth.currentUser.uid,
        "todolists",
        sourceToDoListId,
        "tasks",
        draggableId
      );
      const destinationTaskDocRef = doc(
        db,
        "Users",
        auth.currentUser.uid,
        "todolists",
        destinationToDoListId,
        "tasks",
        draggableId // Task ID remains the same
      );

      // If the task is moved to a different to-do list, delete it from the source to-do list in the database
      if (sourceToDoListId !== destinationToDoListId) {
        await deleteDoc(sourceTaskDocRef);
      }

      // Update the task in the database
      await setDoc(destinationTaskDocRef, updatedTask);

      // Update the lastUpdated field for both source and destination todo lists
      const now = new Date().toISOString();
      const sourceTodolistDocRef = doc(
        db,
        "Users",
        auth.currentUser.uid,
        "todolists",
        sourceToDoListId
      );
      const destinationTodolistDocRef = doc(
        db,
        "Users",
        auth.currentUser.uid,
        "todolists",
        destinationToDoListId
      );

      // Update lastUpdated for source todo list
      await updateDoc(sourceTodolistDocRef, { lastUpdated: now });

      // Update lastUpdated for destination todo list
      await updateDoc(destinationTodolistDocRef, { lastUpdated: now });
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };






  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="user-profile">
        <div className="user-profile-heading">
          <h2>Welcome, {userName}</h2>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
        <div className="todolist-container">
          {todolists.map((todolist, index) => (
            <div className="todolist" key={index}>
              <div className="todolist-header">
                <h3 className="todolist-title">{todolist.name}</h3>
                <button onClick={() => deleteTodolist(todolist.id)}>X</button>
              </div>
              <hr />
              <div className="inside-todolist-container">
                {/* Render tasks by priority */}
                {Object.entries(sortTasksByPriority(todolist.tasks)).map(
                  ([priority, tasks]) => (
                    <div className="priority-box" key={priority}>
                      <h4>{priority} Priority</h4>
                      <Droppable droppableId={`${priority}-${todolist.id}`}>
                        {(provided, snapshot) => (
                          <ul
                            className={`task-list ${
                              snapshot.isDraggingOver ? "drop-target" : ""
                            }`}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {tasks.map((task, taskIndex) => (
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={taskIndex}
                              >
                                {(provided, snapshot) => (
                                  <li
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`task ${
                                      snapshot.isDragging ? "dragging" : ""
                                    }`}
                                  >
                                    <div className="task-heading">
                                      <h4>Title: {task.title}</h4>
                                      <p>Priority: {task.priority}</p>
                                    </div>
                                    <p>Description: {task.description}</p>
                                    <p>Due Date: {task.date}</p>
                                  </li>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};

export default UserProfile;
