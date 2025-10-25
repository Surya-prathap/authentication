import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

const backend_url = "https://authentication-backend-orcin.vercel.app/";

const schema = yup.object().shape({
  name: yup.string().min(4).required("Name is required"),
  email: yup.string().email().required(),
  password: yup.string().min(4).max(8).required(),
});

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleRegister = async (data) => {
    try {
      await axios.post(`${backend_url}api/auth/register`, data, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Registered Successfully...");
      reset();
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleRegister)}>
        <input
          type="text"
          placeholder="Enter your name..."
          {...register("name")}
        />
        <p>{errors.name?.message}</p>
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
          Already account?
          <Link to={"/login"}>
            <button>Login</button>
          </Link>
        </div>
      </form>
    </>
  );
};

export default Register;
