import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    password2: ""
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post(
        "/api/auth/register/",
        formData
      );

      navigate("/");
    } catch (err) {
      if (err.response && err.response.data) {
        console.log("Register Error:", err.response.data);
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Registration failed");
      }
    }

  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <h3 className="text-center mb-4">Register</h3>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Username</label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-success w-100">
              Register
            </button>
          </form>

          <p className="mt-3 text-center">
            Already have an account? <Link to="/">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
