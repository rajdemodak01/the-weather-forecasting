import React, { useState } from "react";
import { Box, Container, Grid, SvgIcon, Typography } from "@mui/material";
import Search from "./components/Search/Search";
import WeeklyForecast from "./components/WeeklyForecast/WeeklyForecast";
import TodayWeather from "./components/TodayWeather/TodayWeather";
import { fetchWeatherData } from "./api/OpenWeatherService";
import { transformDateFormat } from "./utilities/DatetimeUtils";
import UTCDatetime from "./components/Reusable/UTCDatetime";
import LoadingBox from "./components/Reusable/LoadingBox";
import { ReactComponent as SplashIcon } from "./assets/splash-icon.svg";
import Logo from "./assets/logo.png";
import ErrorBox from "./components/Reusable/ErrorBox";
import { ALL_DESCRIPTIONS } from "./utilities/DateConstants";
// import GitHubIcon from "@mui/icons-material/GitHub";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // Import useDispatch
import { setLoginStatus } from "./store/store.js";
// import Register from "./auth/register.js";

import {
  getTodayForecastWeather,
  getWeekForecastWeather,
} from "./utilities/DataUtils";
// import { useSelector } from "react-redux";

function App() {
  // const isRegistered = useSelector((state) => state.isRegisterSlice.status);
  const [todayWeather, setTodayWeather] = useState(null);
  const [todayForecast, setTodayForecast] = useState([]);
  const [weekForecast, setWeekForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate=useNavigate()
  const dispatch=useDispatch()

  const searchChangeHandler = async (enteredData) => {
    const [latitude, longitude] = enteredData.value.split(" ");

    setIsLoading(true);

    const currentDate = transformDateFormat();
    const date = new Date();
    let dt_now = Math.floor(date.getTime() / 1000);

    try {
      const [todayWeatherResponse, weekForecastResponse] =
        await fetchWeatherData(latitude, longitude);
      const all_today_forecasts_list = getTodayForecastWeather(
        weekForecastResponse,
        currentDate,
        dt_now
      );

      const all_week_forecasts_list = getWeekForecastWeather(
        weekForecastResponse,
        ALL_DESCRIPTIONS
      );

      setTodayForecast([...all_today_forecasts_list]);
      setTodayWeather({ city: enteredData.label, ...todayWeatherResponse });
      setWeekForecast({
        city: enteredData.label,
        list: all_week_forecasts_list,
      });
    } catch (error) {
      setError(true);
    }

    setIsLoading(false);
  };

  let appContent = (
    <Box
      xs={12}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        width: "100%",
        minHeight: "500px",
      }}
    >
      <SvgIcon
        component={SplashIcon}
        inheritViewBox
        sx={{ fontSize: { xs: "100px", sm: "120px", md: "140px" } }}
      />
      <Typography
        variant="h4"
        component="h4"
        sx={{
          fontSize: { xs: "12px", sm: "14px" },
          color: "rgba(255,255,255, .85)",
          fontFamily: "Poppins",
          textAlign: "center",
          margin: "2rem 0",
          maxWidth: "80%",
          lineHeight: "22px",
        }}
      >
        Explore current weather data and 6-day forecast of more than 200,000
        cities!
      </Typography>
    </Box>
  );

  if (todayWeather && todayForecast && weekForecast) {
    appContent = (
      <React.Fragment>
        <Grid item xs={12} md={todayWeather ? 6 : 12}>
          <Grid item xs={12}>
            <TodayWeather data={todayWeather} forecastList={todayForecast} />
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <WeeklyForecast data={weekForecast} />
        </Grid>
      </React.Fragment>
    );
  }

  if (error) {
    appContent = (
      <ErrorBox
        margin="3rem auto"
        flex="inherit"
        errorMessage="Something went wrong"
      />
    );
  }

  if (isLoading) {
    appContent = (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minHeight: "500px",
        }}
      >
        <LoadingBox value="1">
          <Typography
            variant="h3"
            component="h3"
            sx={{
              fontSize: { xs: "10px", sm: "12px" },
              color: "rgba(255, 255, 255, .8)",
              lineHeight: 1,
              fontFamily: "Poppins",
            }}
          >
            Loading...
          </Typography>
        </LoadingBox>
      </Box>
    );
  }


  const handleLogout = async () => {
    try {
      // Send logout request to backend (optional, but will help clean up any session server-side)
      const token = localStorage.getItem("accessToken");
      // console.log(`Token from app.js inside handleLogout is ${token}`)
      if (!token) {
        // If no token is found in localStorage, just log the user out
        alert("No token found, logging out...");
        dispatch(setLoginStatus(false)); // Update Redux state
        navigate("/login"); // Navigate to login page
        return;
      }
      const response = await axios.post(`${process.env.REACT_APP_PORT}/auth/logout`, {},{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        // Clear accessToken from localStorage
        localStorage.removeItem("accessToken");
  
        // Dispatch logout action to update Redux state
        dispatch(setLoginStatus(false));
  
        // Redirect the user to the login page
        navigate("/login");
  
        alert("Logout successful");
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out", error);
      alert("An error occurred while logging out");
    }
  };
  
  return (
    <>
      {/* {isRegistered ? ( */}
        <Container
          sx={{
            maxWidth: { xs: "95%", sm: "80%", md: "1100px" },
            width: "100%",
            height: "100%",
            margin: "0 auto",
            padding: "1rem 0 3rem",
            marginBottom: "1rem",
            borderRadius: {
              xs: "none",
              sm: "0 0 1rem 1rem",
            },
            boxShadow: {
              xs: "none",
              sm: "rgba(0,0,0, 0.5) 0px 10px 15px -3px, rgba(0,0,0, 0.5) 0px 4px 6px -2px",
            },
          }}
        >
          <Grid container columnSpacing={2}>
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  width: "100%",
                  marginBottom: "1rem",
                }}
              >
                <Box
                  component="img"
                  sx={{
                    height: { xs: "16px", sm: "22px", md: "26px" },
                    width: "auto",
                  }}
                  alt="logo"
                  src={Logo}
                />

                <UTCDatetime />
                {/* <Link
                  href="https://github.com/rajdemodak01"
                  target="_blank"
                  underline="none"
                  sx={{ display: "flex" }}
                >
                  <GitHubIcon
                    sx={{
                      fontSize: { xs: "20px", sm: "22px", md: "26px" },
                      color: "white",
                      "&:hover": { color: "#2d95bd" },
                    }}
                  />
                </Link> */}
                <button onClick={handleLogout}>
                  logout
                </button>
              </Box>
              <Search onSearchChange={searchChangeHandler} />
            </Grid>
            {appContent}
          </Grid>
        </Container>
      {/* ) : ( */}
        {/* <Register /> */}
      {/* )} */}
    </>
  );
}

export default App;
