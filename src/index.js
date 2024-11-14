import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store/store.js";
import LoginPage from "./auth/login.js";
import RegisterPage from "./auth/register.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthLayout from "./utilities/AuthLayout.js"
import Main from "./Main.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        path: "/home",
        element: (
          <AuthLayout authentication>
            <App />
          </AuthLayout>
        ),
      },
      {
        path: "/",
        element: (
          <AuthLayout authentication>
            <App />
          </AuthLayout>
        ),
      },
      {
        path: "/login",
        element: (
          <AuthLayout authentication={false}>
            <LoginPage />
          </AuthLayout>
        ),
      },
      {
        path: "/register",
        element: (
          <AuthLayout authentication={false}>
            <RegisterPage />
          </AuthLayout>
        ),
      },
    ],
  },
]);

root.render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
