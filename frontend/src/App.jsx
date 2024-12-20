import { createHashRouter, Outlet, RouterProvider } from "react-router-dom";
import { Container, CircularProgress } from "@mui/material";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchUser } from "./redux/userAuth/authSlice";
import { I18nextProvider } from "react-i18next";
import { ToastContainer } from "react-toastify";
import initializeI18n from "./i18n";

import AppHeader from "./components/AppHeader";
import AppFooter from "./components/AppFooter";

// Import pages components
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Editor from "./pages/Editor";

const MainLayout = () => (
  <>
    <AppHeader />
    <Container style={{ paddingTop: 36, minHeight: "calc(100vh - 128px)" }}>
      <Outlet />
    </Container>
    <ToastContainer />
    <AppFooter />
  </>
);

const router = createHashRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "", element: <Home /> },
      { path: "projects", element: <Projects /> },
    ],
  },
  {
    path: "editor/:projectId",
    element: <Editor />,
  },
]);

function App() {
  const dispatch = useDispatch();
  const [i18nInstance, setI18nInstance] = useState(null);

  useEffect(() => {
    dispatch(fetchUser());

    // Initialize i18n and set the instance
    initializeI18n().then((instance) => {
      setI18nInstance(instance);
    });
  }, [dispatch]);

  if (!i18nInstance) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={40} />
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      <RouterProvider router={router} />
    </I18nextProvider>
  );
}

export default App;
