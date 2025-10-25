import React, { useEffect, useState } from "react";
import axios from "axios";

const AddTask = () => {
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");

  const [taskList, setTaskList] = useState([]);

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");

  const [editingId, setEditingId] = useState(null);

  const [editTask, setEditTask] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const backend_url = "https://authentication-backend-orcin.vercel.app/";

  const getTasks = async () => {
    try {
      const res = await axios.get(`${backend_url}api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTaskList(res.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Error in getting tasks");
    }
  };

  useEffect(() => {
    getTasks();
  }, [token]);

  const addTask = async () => {
    if (task.trim() === "" || description.trim() === "") {
      alert("Enter both task and description");
      return;
    }
    try {
      // const token = localStorage.getItem("token");

      const res = await axios.post(
        `${backend_url}/api/tasks`,
        { task, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTaskList([...taskList, res.data.task]);
      setTask("");
      setDescription("");
      alert("Task added Successfully.");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Error in adding task");
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    const updatedList = taskList.map((t) =>
      t._id === updatedTask._id ? updatedTask : t
    );
    setTaskList(updatedList);
  };

  const Edit = (task) => {
    setEditingId(task._id);
    setEditTask(task.task);
    setEditDesc(task.description);
  };

  const handleEdit = async (id) => {
    try {
      const res = await axios.put(
        `${backend_url}/api/tasks/${id}`,
        { task: editTask, description: editDesc },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      handleTaskUpdated(res.data);
      getTasks();
      setEditingId(null);
    } catch (error) {
      console.log(error);
      alert("error in updating task...");
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await axios.put(
        `${backend_url}/api/tasks/${id}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTaskList(
        taskList.map((t) => (t._id === id ? { ...t, done: !t.done } : t))
      );
    } catch (error) {
      console.log(error);
      alert("error in updating task...");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/tasks/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTaskList(taskList.filter((t) => t._id !== id));
      alert("task deleted successfully");
    } catch (error) {
      console.log(error);
      alert("error in deleting  task...");
    }
  };

  return (
    <>
      <input
        style={{ marginBottom: "20px" }}
        type="text"
        value={task}
        placeholder="Enter task..."
        onChange={(e) => setTask(e.target.value)}
      />{" "}
      <br />
      <textarea
        style={{ marginBottom: "20px" }}
        value={description}
        placeholder="Add description"
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>{" "}
      <br />
      <button onClick={addTask}>Add Task</button>
      <h2>This is Tasks List (User: {userName ? userName : "Guest"} )</h2>
      {taskList.length === 0 ? (
        <p>No Tasks Yet...</p>
      ) : (
        taskList.map((t) => (
          <div key={t._id}>
            {editingId === t._id ? (
              <>
                <input
                  type="text"
                  value={editTask}
                  onChange={(e) => setEditTask(e.target.value)}
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
                <button onClick={() => handleEdit(t._id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <div
                  style={{
                    color: "black",
                    fontSize: "25px",
                    fontWeight: "bold",
                    marginBottom: 0,
                  }}
                >
                  Title:
                  <span className={t.done ? "done" : "not-done"}>{t.task}</span>
                </div>
                <div
                  style={{
                    color: "black",
                    marginBottom: "20px",
                    marginTop: 0,
                    fontSize: "18px",
                  }}
                >
                  description: {t.description}
                </div>
                <button onClick={() => handleComplete(t._id)}>
                  {t.done ? "Undo" : "Complete"}
                </button>
                <button onClick={() => Edit(t)}>Edit</button>
                <button onClick={() => handleDelete(t._id)}>Delete</button>
              </>
            )}
          </div>
        ))
      )}
    </>
  );
};

export default AddTask;
