import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import WindowSharpIcon from "@mui/icons-material/WindowSharp";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

const FooterTab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActiveRoute = (route) => location.pathname === route;
  const activeColor = "#ff8a2b";

  // store icon components (not elements) so we can pass sx props
  const footerButtons = [
    { label: "Home", icon: HomeOutlinedIcon, route: "/page1" },
    { label: "Menu", icon: WindowSharpIcon, route: "/page2" },
    // { label: "Orders", icon: AssignmentOutlinedIcon, route: "/orders" },
    { label: "Orders", icon: AssignmentOutlinedIcon, route: "/page3" },
    { label: "Pay Bill", icon: ReceiptLongOutlinedIcon, route: "/page1" },
    // { label: "Pay Bill", icon: ReceiptLongOutlinedIcon, route: "/bills" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      {footerButtons.map((btn) => {
        const active = isActiveRoute(btn.route);
        const IconComp = btn.icon;
        return (
          <Button
            key={btn.label}
            onClick={() => navigate(btn.route)}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              minWidth: 64,
              color: active ? activeColor : "grey",
              textTransform: "none",
              background: "transparent",
              "&:hover": { background: "transparent" },
            }}
          >
            <IconComp sx={{ color: active ? activeColor : "grey", fontSize: 24 }} />
            <Typography sx={{ fontSize: 12, color: active ? activeColor : "grey" }}>
              {btn.label}
            </Typography>
          </Button>
        );
      })}
    </Box>
  );
};

export default FooterTab;
