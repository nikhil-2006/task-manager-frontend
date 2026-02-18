import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);



  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  // ---------------- FETCH DATA ----------------
  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/auth/profile/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
    } catch {
      navigate("/");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);


  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const profileRes = await axios.get(
          "http://127.0.0.1:8000/api/auth/profile/",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const taskRes = await axios.get(
          "http://127.0.0.1:8000/api/tasks/",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProfile(profileRes.data);
        setTasks(taskRes.data);

      } catch (error) {
        console.error(error);
        navigate("/");
      }
    };

    fetchData();

  }, [token, navigate]);


  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/tasks/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------- SCROLL ----------------
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setSidebarOpen(false);
  };

  // ---------------- CREATE / UPDATE ----------------
  const handleSubmitTask = async (e) => {
    e.preventDefault();

    try {
      if (editingTask) {
        await axios.put(
          `http://127.0.0.1:8000/api/tasks/${editingTask.id}/`,
          newTask,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingTask(null);
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/tasks/",
          newTask,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setNewTask({ title: "", description: "", status: "pending" });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/tasks/${id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  return (
    <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}>

      {/* OVERLAY (Mobile Only) */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay d-md-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
      >
        <div>
          <h5 className="fw-bold mb-4">Task Manager</h5>

          <ul className="nav flex-column gap-3">
            <li>
              <button
                className="btn btn-link text-dark text-start p-0"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setSidebarOpen(false);
                }}
              >
                Dashboard
              </button>
            </li>

            <li>
              <button
                className="btn btn-link text-dark text-start p-0"
                onClick={() => scrollToSection(fetchProfile)}
              >
                Profile
              </button>
            </li>

            <li>
              <button
                className="btn btn-link text-dark text-start p-0"
                onClick={() => scrollToSection(fetchTasks)}
              >
                Tasks
              </button>
            </li>
          </ul>
        </div>

        <button
          className="btn btn-outline-danger btn-sm w-100"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="content-wrapper">

        {/* Mobile Toggle */}
        <button
          className="btn btn-sm btn-outline-dark d-md-none mb-3"
          onClick={() => setSidebarOpen(prev => !prev)}
        >
          ☰ Menu
        </button>

        {/* HEADER */}
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p className="text-muted mb-0">
            Organize your work efficiently
          </p>
        </div>

        {/* PROFILE */}
        {profile && (
          <div ref={profileRef} className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">Profile</h6>
              <p className="mb-1 text-muted">Email</p>
              <p className="fw-medium">{profile.email}</p>
              <p className="mb-1 text-muted">Username</p>
              <p className="fw-medium">{profile.username}</p>
            </div>
          </div>
        )}

        {/* TASK FORM */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body">
            <h6 className="fw-semibold mb-3">
              {editingTask ? "Update Task" : "Create Task"}
            </h6>

            <form onSubmit={handleSubmitTask}>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                required
              />

              <textarea
                className="form-control mb-3"
                placeholder="Description"
                rows="3"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                required
              />

              <select
                className="form-select mb-3"
                value={newTask.status}
                onChange={(e) =>
                  setNewTask({ ...newTask, status: e.target.value })
                }
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              <button type="submit" className="btn btn-primary btn-sm px-3">
                {editingTask ? "Update" : "Add"}
              </button>
            </form>
          </div>
        </div>

        {/* TASK LIST */}
        <div ref={taskRef} className="card border-0 shadow-sm rounded-4">
          <div className="card-body">

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold mb-0">
                Your Tasks ({tasks.length})
              </h6>

              <input
                type="text"
                className="form-control form-control-sm"
                style={{ maxWidth: "200px" }}
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {tasks.length === 0 ? (
              <p className="text-muted">No tasks yet.</p>
            ) : (
              <div className="row g-3">
                {tasks
                  .filter((task) =>
                    task.title
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((task) => (
                    <div key={task.id} className="col-md-6 col-lg-4">
                      <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body d-flex flex-column justify-content-between">

                          <div>
                            <h6 className="fw-semibold">{task.title}</h6>
                            <p className="text-muted small">
                              {task.description}
                            </p>

                            <span
                              className={`badge ${task.status === "completed"
                                ? "bg-success"
                                : "bg-secondary"
                                }`}
                            >
                              {task.status}
                            </span>
                          </div>

                          <div className="d-flex gap-2 mt-3">
                            <button
                              className="btn btn-sm btn-light border"
                              onClick={() => {
                                setEditingTask(task);
                                setNewTask({
                                  title: task.title,
                                  description: task.description,
                                  status: task.status,
                                });
                              }}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-light border text-danger"
                              onClick={() => handleDelete(task.id)}
                            >
                              Delete
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
