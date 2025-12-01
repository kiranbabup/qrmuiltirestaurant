// LoginPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import companyLogo from "./data/images/invposlogo.png";
import sendOtpimg from "./data/images/Loginicon.png";
import loginBg from "./data/images/login-bg.png";
import "./App.css";
import LsService, { storageKey } from "./services/localstorage";
import { loginDNR } from "./services/api";
import { layoutDarkGreenColor } from "./data/contents";

const LoginNewPage = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const user = LsService.getItem(storageKey);

  useEffect(() => {
    // console.log(user);
    if (user) {
      if (user.role === "dnr_super_admin") {
        navigate("/dnr_super_admin");
      }
    } else {
      return;
    }
  }, [user, navigate]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async () => {
    setErrorMsg("");
    try {
      const response = await loginDNR({ phone: loginId, password });
      console.log(response.data);
      //   const { token } = response.data;
      //   const branchDetails = response.data.user.Branch;
      const { name, phone, status, user_id } = response.data.user;
      if (!status) {
        setErrorMsg(
          "Your account is inactive. Please contact the administrator."
        );
        return;
      }
      LsService.setItem(storageKey,{
        username: name,
        role: "dnr_super_admin",
        phone,
        user_id
      });
      navigate("/dnr_super_admin");
      //   if (role === "dnr_super_admin") {
      //   } else {
      // setErrorMsg("Invalid user type.");
      //   }
    } catch (error) {
      setErrorMsg("Invalid Login ID or Password or contact Administrator.");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
      }}
    >
      <Box
        component="img"
        alt="Company Logo"
        src={companyLogo}
        sx={{
          width: "65px",
          cursor: "pointer",
          display: { md: "none", xs: "block" },
          pl: 2,
          paddingTop: "10px",
          position: "fixed",
          top: 0,
          left: 0,
        }}
        onClick={() => navigate("/")}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "start",
          height: "100vh",
          width: "100vw",
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* left */}
        <Box
          sx={{
            width: { xs: "100%", md: "50%" },
            display: { xs: "none", md: "block" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Box
              component="img"
              alt="Company Logo"
              src={companyLogo}
              sx={{
                width: "250px",
                // ml: 2,
                cursor: "pointer",
              }}
              onClick={() => navigate("/")}
            />
          </Box>
        </Box>
        {/* right */}
        <Box
          sx={{
            width: { md: "50%" },
            p: { xs: 2, md: 0 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            // backgroundColor: { md: "#577fd8d9" },
            height: "100%",
          }}
        >
          <Box
            sx={{
              width: { md: "50%" },
              p: 2,
              bgcolor: "white",
              boxShadow: 2,
              borderRadius: "10px",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Box
                component="img"
                alt="otp page"
                src={sendOtpimg}
                sx={{
                  //   width: "130px",
                  width: { xs: "100px", md: "130px" },
                  height: { xs: "110px", md: "140px" },
                  cursor: "pointer",
                }}
              />
            </Box>
            <Typography
              gutterBottom
              sx={{
                fontSize: { xs: "1.4rem", md: "2.5rem" },
                fontWeight: "bold",
                textAlign: "center",
                color: { md: layoutDarkGreenColor },
              }}
            >
              Login Now !
            </Typography>

            <TextField
              label="Login ID"
              variant="outlined"
              fullWidth
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{
                maxLength: 30,
                style: { textAlign: "center", fontWeight: "bold" },
                // sx: { color: { md: "white" } },
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{
                maxLength: 15,
                style: { textAlign: "center", fontWeight: "bold" },
                // sx: { color: { md: "white" } },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />

            {errorMsg && (
              <Typography color="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Typography>
            )}
            {!errorMsg && <Box p={2.5} />}

            <Button
              variant="contained"
              sx={{ fontWeight: "bold" }}
              type="submit"
              color="primary"
              fullWidth
              onClick={() => handleLogin()}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginNewPage;
