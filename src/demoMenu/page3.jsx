import React, { useEffect, useMemo, useState } from "react";
import belloso from "../data/images/belloso.png";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Stack,
  Divider,
  Modal,
  IconButton,
} from "@mui/material";
import { pageStyle } from "../data/styles";
import TableBarOutlinedIcon from "@mui/icons-material/TableBarOutlined";
import categoryPng from "../data/images/categoryPng.png";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import {
  items as allItems,
  categories as allCategories,
} from "../data/contents/items";
import FooterTab from "./FooterTab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ContactModal from "./ContactModal";
import SnackbarCompo from "./SnackbarCompo";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { useNavigate } from "react-router-dom";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import DiningIcon from "@mui/icons-material/Dining";

const Page3 = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const viewOrderedItems = () => {
    setLoading(true);
    try {
      const orderdItems = localStorage.getItem("currentOrderData");
      // feedback + close
    } catch (e) {
      console.error("Error retrieving order data:", e);
    }
  };

  return (
    <Box>
      {/* Large screen warning */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "100vw",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
        }}
      >
        Not compatible with large screens. Please use Mobile or smaller screen
        devices.
      </Box>

      {/* Mobile View */}
      <Box sx={{ width: "100vw", display: { xs: "flex", md: "none" } }}>
        <Box sx={pageStyle}>
          {/* Header */}
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 2,
              width: "100%",
            }}
          >
            {/* logo & table */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "70%",
                  pl: 1,
                }}
              >
                <img
                  src={belloso}
                  alt="Cafe Belloso"
                  style={{
                    width: 44,
                    height: 44,
                    objectFit: "contain",
                    padding: "5px",
                  }}
                />
                <Typography>Cafe Belloso</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "4px",
                  backgroundColor: "#e9e8e8",
                  p: "5px 10px",
                  mr: 1,
                }}
              >
                <TableBarOutlinedIcon />
                <Typography sx={{ ml: 1, fontWeight: "bold" }}>24</Typography>
              </Box>
            </Box>
            {/* buttons switching */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Button
                sx={{
                  width: "50%",
                  borderBottom: "1px solid grey",
                  textTransform: "none",
                  color: "grey",
                }}
              >
                <DiningIcon
                  sx={{
                    mr: 1,
                    bgcolor: "grey",
                    color: "white",
                    borderRadius: "5px",
                  }}
                />{" "}
                Orders{" "}
                <span
                  style={{
                    marginLeft: 5,
                    borderRadius: "50%",
                    height: "25px",
                    width: "25px",
                    backgroundColor: "grey",
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  00
                </span>
              </Button>
              <Button
                sx={{
                  width: "50%",
                  textTransform: "none",
                  borderBottom: "3px solid #ff8a2b",
                  color: "#ff8a2b",
                }}
              >
                <AssignmentOutlinedIcon sx={{ mr: 1, color: "#ff8a2b" }} />
                {" "}
                Item List{" "}
                <span
                  style={{
                    marginLeft: 5,
                    borderRadius: "50%",
                    height: "25px",
                    width: "25px",
                    backgroundColor: "#ff8a2b",
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  01
                </span>
              </Button>
            </Box>
          </Box>
          <Divider />
        </Box>

        {/* Footer */}
        <Box
          sx={{
            position: "fixed",
            zIndex: 1,
            bottom: 0,
            left: 0,
            width: "100%",
            height: "10vh",
            backgroundColor: "#fff",
          }}
        >
          <FooterTab />
        </Box>
      </Box>
    </Box>
  );
};
export default Page3;
