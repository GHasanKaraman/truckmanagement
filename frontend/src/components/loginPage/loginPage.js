import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { useSnackbar } from "notistack";

import { userInformations } from "../../atoms/userAtoms";
import { useRecoilState } from "recoil";

import truck from "../../images/truck.gif";
import road from "../../images/road.gif";

import "./login.css";
import { b64EncodeUnicode } from "../../utils/helpers.js";
import baseRequest from "../../core/baseRequest.js";
import { errorHandler } from "../../core/errorHandler.js";
import useControl from "../../hooks/useControl.js";

const LoginPage = (props) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [_, setUser] = useRecoilState(userInformations);

  const [auth] = useControl();

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {
    if (auth(undefined, false, true)) {
      navigate("/dashboard");
    }
  }, []);

  const userLogin = async (values) => {
    if (values.remember) {
      localStorage.setItem("username", values.username);
      localStorage.setItem("remember", true);
    } else {
      localStorage.removeItem("username");
      localStorage.removeItem("remember");
    }

    const encoded = b64EncodeUnicode(values.username + "=" + values.password);
    baseRequest.addHeader(encoded);
    try {
      const response = await baseRequest.post("/login", null);
      if (response?.data?.user?._id) {
        const data = response.data;
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        baseRequest.addToken(data.token);
        setUser(data.user);
        if (
          data.user.permissions.includes("r") ||
          data.user.permissions.includes("a")
        ) {
          navigate("/dashboard");
        } else {
          navigate("/noaccess");
        }
      } else {
        enqueueSnackbar(
          "Something went wrong while fetching user informations!",
          {
            variant: "error",
          },
        );
      }
    } catch (error) {
      const { data, status } = errorHandler(error);
      switch (status) {
        case 400:
          enqueueSnackbar("Your session is interrupted!", {
            variant: "error",
          });
          break;
        case 404:
          enqueueSnackbar("Your username or password is incorrect!", {
            variant: "error",
          });
          break;

        case 500:
          enqueueSnackbar(
            "Something went wrong while authenticate the credentials!",
            {
              variant: "error",
            },
          );
          break;
        default:
          enqueueSnackbar(data, {
            variant: "error",
          });
          break;
      }
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    userLogin(values);
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: yup.object().shape({
      username: yup.string().required("Please enter your username!"),
      password: yup.string().required("Please enter your password!"),
    }),
    onSubmit: handleSubmit,
  });

  return (
    <section>
      <div className="logo">
        <img className="truck" alt="background" src={truck} />
        <div className="road" />
      </div>
      <form className="login" onSubmit={formik.handleSubmit}>
        <p
          style={{
            alignSelf: "center",
            fontWeight: 600,
            fontSize: 70,
            color: "#f55b1a",
            margin: 0,
          }}
        >
          CiboTrucks
        </p>
        <div className="inputBox">
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={formik.values.username}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          <span className="errorText">
            {formik.touched.username && formik.errors.username}
          </span>
        </div>
        <div className="inputBox">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formik.values.password}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          <span className="errorText">
            {formik.touched.password && formik.errors.password}
          </span>
        </div>
        <div className="inputBox">
          <input type="submit" value="Login" id="btn" />
        </div>
        <div className="group">
          <a href="#forget">Forget Password</a>
          <a href="#signup">Signup</a>
        </div>
      </form>
    </section>
  );
};

export default LoginPage;
