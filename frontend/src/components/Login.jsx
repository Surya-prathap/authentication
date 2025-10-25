import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

const backend_url = "https://authentication-backend-orcin.vercel.app/";

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(4).max(8).required(),
});

const Login = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleLogin = async (data) => {
    try {
      const res = await axios.post(`${backend_url}/api/auth/login`, data);
      localStorage.setItem("token", res.data.token);
      alert("Login Successful");
      localStorage.setItem("userName", res.data.user.name);
      navigate("/add-task");
    } catch (error) {
      if (error.response) {
        alert(error.response.data.msg);
      } else {
        alert("Something went wrong:Please try again later");
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleLogin)}>
        <input
          type="text"
          placeholder="Enter your email..."
          {...register("email")}
        />
        <p>{errors.email?.message}</p>
        <input
          type="password"
          placeholder="Enter your password..."
          {...register("password")}
        />
        <p>{errors.password?.message}</p>
        <input type="submit" />

        <div style={{ marginTop: "20px" }}>
          Not account Yet..
          <Link to={"/"}>
            <button>Register</button>
          </Link>
        </div>
      </form>
    </>
  );
};

export default Login;
