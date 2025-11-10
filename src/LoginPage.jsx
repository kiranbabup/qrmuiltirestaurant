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
import companyLogo from "./data/images/belloso.png";
import sendOtpimg from "./data/images/Loginicon.png";
import "./App.css";
import LsService, { storageKey } from "./services/localstorage";
import { login } from "./services/api";

// CASE 1: Super Admin bypass by Login ID
const SUPER_ADMIN_USER_ID = "qrsuperus1";
// If you want a password for bypass, add this and check it too:
const SUPER_ADMIN_PASSWORD = "qrsuperus@123";

const LoginPage = () => {
  const [loginId, setLoginId] = useState("");
  const [pwd, setPwd] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const user = LsService.getItem(storageKey);

  const routeForRole = (role) => {
    switch (role) {
      case "super_admin":
        return "/super_admin";
      case "restaurant_admin":
        return "/restaurant-admin";
      case "manager":
        return "/restaurant-manager";
      case "staff":
        return "/staff";
      case "kitchen_chef":
        return "/restaurant-kitchen-chef";
      default:
        return "/";
    }
  };

  useEffect(() => {
    if (!user) return;
    const path = routeForRole(user.role);
    if (path) navigate(path);
  }, [user, navigate]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async () => {
    setErrorMsg("");

    // ===== CASE 1: Super Admin bypass =====
    if (loginId.trim() === SUPER_ADMIN_USER_ID && pwd === SUPER_ADMIN_PASSWORD) {
      LsService.setItem(storageKey, {
        username: "Super Admin",
        role: "super_admin",
      });
      navigate(routeForRole("super_admin"));
      return;
    }

    // ===== CASE 2: Normal API login =====
    try {
      const response = await login({ username: loginId, password: pwd });
      const { role, restaurant_code, is_active, restaurant_id, user_id } =
        (response && response.data && response.data.user) || {};

      if (is_active === false) {
        setErrorMsg("Your account is inactive. Please contact the administrator.");
        return;
      }

      if (!["restaurant_admin", "manager", "staff", "kitchen_chef"].includes(role)) {
        setErrorMsg("Invalid user type.");
        return;
      }

      const payload = { username: loginId, role };
      if (restaurant_code) payload.restaurant_code = restaurant_code;
      if (restaurant_id) payload.restaurant_id = restaurant_id;
      if (user_id) payload.user_id = user_id;

      LsService.setItem(storageKey, payload);
      navigate(routeForRole(role));
    } catch (error) {
      setErrorMsg("Invalid Login ID or Password or contact Administrator.");
    }
  };

  return (
    <Box sx={{ height: "100vh" }}>
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
        }}
        onClick={() => navigate("/")}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "start",
          height: { md: "100vh", xs: "calc(100vh - 68px)" },
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
              sx={{ width: "250px", cursor: "pointer" }}
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
            backgroundColor: { md: "#577fd8d9" },
            height: "100%",
          }}
        >
          <Box sx={{ width: { md: "50%" } }}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Box
                component="img"
                alt="otp page"
                src={sendOtpimg}
                sx={{ width: "130px", height: "140px", cursor: "pointer" }}
              />
            </Box>

            <Typography
              gutterBottom
              sx={{
                fontSize: { xs: "1.5rem", md: "2.5rem" },
                fontWeight: "bold",
                textAlign: "center",
                color: { md: "white" },
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
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{
                maxLength: 40,
                style: { textAlign: "center", fontWeight: "bold" },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />

            {errorMsg ? (
              <Typography color="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Typography>
            ) : (
              <Box p={2.5} />
            )}

            <Button
              variant="contained"
              sx={{ fontWeight: "bold" }}
              type="submit"
              color="primary"
              fullWidth
              onClick={handleLogin}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
