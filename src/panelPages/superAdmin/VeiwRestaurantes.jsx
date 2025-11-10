import { Box, Paper, Button, Typography, MenuItem } from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LsService, { storageKey } from "../../services/localstorage";
import { createRestaurants, fetchSubscriptions } from "../../services/api";
import RHFTextField from "../../components/RHFTextField";
import { useForm, FormProvider } from "react-hook-form";
import SnackbarCompo from "../../components/SnackbarCompo";
import SmallScreenError from "../../components/panelComponents/SmallScreenError";
import { lrgScreenStyle } from "../../components/panelComponents/panelStyles";
import { styled } from "@mui/styles";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const VeiwRestaurantes = () => {
  const navigate = useNavigate();
  const user = LsService.getItem(storageKey);

  const [loading, setLoading] = useState(false);
  const [snackbarContent, setsnackbarContent] = useState("");
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [snackbarMode, setSnackbarMode] = useState("");
  const [restaurantesList, setRestaurantesList] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "super_admin") {
      LsService.removeItem(storageKey);
      navigate("/");
    }
    fetchRestaurantesList();
  }, [user, navigate]);

  const fetchRestaurantesList = async () => {
    try {
      setLoading(true);
      const restaurantesData = await fetchSubscriptions();
      console.log(restaurantesData);
      setRestaurantesList(restaurantesData);
      setsnackbarContent("Restaurants Loaded Successfully");
      setSnackbarMode("success");
      setSuccessSnackbarOpen(true);
    } catch (e) {
      setsnackbarContent("Failed to load restaurants List. Please try again");
      setSnackbarMode("error");
      setSuccessSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (_e, reason) => {
    if (reason === "clickaway") return;
    setSuccessSnackbarOpen(false);
  };

  return (
    <Box>
      {/* Large screen view */}
      <Box sx={lrgScreenStyle}>
        {/* left panel */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "start",
            width: "18vw",
            maxHeight: "100vh",
            mx: "8px",
          }}
        >
          <LeftPannel HeaderTitle="Super Admin" />
        </Box>

        {/* right panel*/}
        <Box
          sx={{
            width: "calc( 100vw - 20vw )",
            display: "flex",
            flexDirection: "column",
            height: "97vh",
          }}
        >
          <HeaderPannel HeaderTitle="Restaurants List" />
          <Box
            sx={{
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: 0, height: 0 },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              borderRadius: "10px",
              boxShadow:
                "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
            }}
          >
            <Box>restaurantesData</Box>
          </Box>
        </Box>

        <SnackbarCompo
          handleSnackbarClose={handleSnackbarClose}
          successSnackbarOpen={successSnackbarOpen}
          snackbarContent={snackbarContent}
          snackbarMode={snackbarMode}
        />
      </Box>

      {/* Mobile View warning*/}
      <SmallScreenError />
    </Box>
  );
};

export default VeiwRestaurantes;
