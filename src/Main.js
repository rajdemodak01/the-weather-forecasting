import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoginStatus } from "./store/store.js";
import { useEffect, useState } from "react";
import axios from "axios";

function Main() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        console.log("inside checkAuth");
        
        if (token) {
          const response = await axios.get(`${process.env.REACT_APP_PORT}/auth/current-user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.status === 200) {
            dispatch(setLoginStatus(true));
          } else {
            dispatch(setLoginStatus(false));
          }
        } else {
          dispatch(setLoginStatus(false));
        }
      } catch (error) {
        console.error("Error checking authentication", error);
        dispatch(setLoginStatus(false)); 
      } finally {
        console.log("outside checkAuth");
        console.log(process.env.REACT_APP_PORT)
        setLoading(false); 
      }
    };

    checkAuth();
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>; // Show loading state while checking auth
  }

  return (
    <div className="min-h-screen flex flex-wrap content-between bg-gray-400">
      <div className="w-full block">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Main;
