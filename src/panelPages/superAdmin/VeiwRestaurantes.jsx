import {
  Box,
  Paper,
  Button,
  Typography,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  TablePagination,
} from "@mui/material";
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
import {
  headerBoxStyle,
  lrgScreenStyle,
  rightInnerBoxStyle,
} from "../../components/panelComponents/panelStyles";
import { styled } from "@mui/styles";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import MainNavHeader from "../../components/panelComponents/MainNavHeader";
import {
  layoutDarkGreenColor,
  layoutLightGreenColor,
} from "../../data/contents";

const getLSsafe = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
  } catch {
    return [];
  }
};

const VeiwRestaurantes = () => {
  const navigate = useNavigate();
  const user = LsService.getItem(storageKey);

  const [loading, setLoading] = useState(false);
  const [snackbarContent, setsnackbarContent] = useState("");
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [snackbarMode, setSnackbarMode] = useState("");
  const [restaurantesList, setRestaurantesList] = useState([]);

  // useEffect(() => {
  //   if (!user || user.role !== "super_admin") {
  //     LsService.removeItem(storageKey);
  //     navigate("/");
  //   }
  //   fetchRestaurantesList();
  // }, [user, navigate]);

  // const fetchRestaurantesList = async () => {
  //   try {
  //     setLoading(true);
  //     const restaurantesData = await fetchSubscriptions();
  //     console.log(restaurantesData);
  //     setRestaurantesList(restaurantesData);
  //     setsnackbarContent("Restaurants Loaded Successfully");
  //     setSnackbarMode("success");
  //     setSuccessSnackbarOpen(true);
  //   } catch (e) {
  //     setsnackbarContent("Failed to load restaurants List. Please try again");
  //     setSnackbarMode("error");
  //     setSuccessSnackbarOpen(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSnackbarClose = (_e, reason) => {
    if (reason === "clickaway") return;
    setSuccessSnackbarOpen(false);
  };

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // derive visible rows
  const paginatedRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  useEffect(() => {
    // reset page if current page is out of range when rows change
    if (page > 0 && page * rowsPerPage >= rows.length) {
      setPage(0);
    }
  }, [rows, page, rowsPerPage]);

  useEffect(() => {
    setRows(getLSsafe("rest_reg_data"));
  }, []);

  return (
    <Box>
      {/* Large screen view */}
      <Box sx={lrgScreenStyle}>
        <Box sx={headerBoxStyle}>
          <MainNavHeader
            headerTitle="Super Admin Dashboard"
            headerNavStartTitle="Home"
            homeNavigate="/super_admin"
            headerNavEndTitle="View Restaurants"
          />
        </Box>

        <Box sx={rightInnerBoxStyle}>
          <Box
            sx={{
              width: "96%",
              p: 2,
            }}
          >
            <Box
              sx={{
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: 0, height: 0 },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
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
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: layoutDarkGreenColor }}>
                        <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                          Created At
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                          Name
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                          Email
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                          Phone
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                          City
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                          State
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                          Tax ID
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                          Tables
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={rows.length} align="center">
                            <CircularProgress />
                          </TableCell>
                        </TableRow>
                      ) : rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={rows.length} align="center">
                            No data available
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRows.reverse().map((r, idx) => {
                          const index = page * rowsPerPage + idx;
                          return (
                            <TableRow
                              key={
                                r.id || r.restaurantData?.res_name || `${index}`
                              }
                              sx={{
                                backgroundColor:
                                  index % 2 === 1
                                    ? layoutLightGreenColor
                                    : "inherit",
                                "&:hover": {
                                  backgroundColor: "#87ceeb !important", // sky blue shade
                                  cursor: "pointer",
                                },
                              }}
                            >
                              <TableCell>
                                {r.created_at
                                  ? new Date(r.created_at).toLocaleString()
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {r.restaurantData?.res_name || "-"}
                              </TableCell>
                              <TableCell>
                                {r.restaurantData?.email || "-"}
                              </TableCell>
                              <TableCell>
                                {r.commonData?.phone || "-"}
                              </TableCell>
                              <TableCell>{r.commonData?.city || "-"}</TableCell>
                              <TableCell>
                                {r.commonData?.state || "-"}
                              </TableCell>
                              <TableCell>
                                {r.locationData?.tax_id || "-"}
                              </TableCell>
                              <TableCell>
                                {r.locationData?.no_of_tables ?? "-"}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={rows.length}
                    page={page}
                    onPageChange={(_e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setRowsPerPage(v);
                      setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Rows per page"
                  />
                </TableContainer>
              </Box>
            </Box>

            <SnackbarCompo
              handleSnackbarClose={handleSnackbarClose}
              successSnackbarOpen={successSnackbarOpen}
              snackbarContent={snackbarContent}
              snackbarMode={snackbarMode}
            />
          </Box>
        </Box>
      </Box>

      {/* Mobile View warning*/}
      <SmallScreenError />
    </Box>
  );
};

export default VeiwRestaurantes;
