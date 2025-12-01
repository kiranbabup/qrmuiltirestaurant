import { Navigate, Outlet } from "react-router-dom";
import LsService, { storageKey } from "../services/localstorage";
import { Box } from "@mui/material";
import MainLeftSidePanel from "./panelComponents/MainLeftSidePanel";
import MainRightHeaderBar from "./panelComponents/MainRightHeaderBar";
import { useState } from "react";
import { projectBackgroundColor } from "../data/contents";

const roleDefaultPaths = {
  super_admin: "/super_admin",
  restaurant_admin: "/restaurant_admin",
  manager: "/manager",
  staff: "/staff",
  kitchen_chef: "/kitchen_staff",
};

const ProtectedRoute = ({ loggedinUserRole }) => {
  const [userLoginStatus] = useState(() => LsService.getItem(storageKey));

  // CASE 1: Not logged in at all
  if (!userLoginStatus) {
    return <Navigate to="/login" replace />;
  }

  const userRole = userLoginStatus.role;

  // CASE 2: Logged in but role mismatch
  if (userRole !== loggedinUserRole) {
    // Option A → Show 404
    // return <Navigate to="/404" replace />;

    // Option B → Redirect to their own dashboard
    return <Navigate to={roleDefaultPaths[userRole] || "/"} replace />;
  }

  // CASE 3: Logged in with correct role
  return (
    <Box sx={{
      width: "100vw",
      height: "100vh",
      backgroundColor: projectBackgroundColor,
      display: "flex",
      alignItems: "flex-start",
      gap: 2,
    }}>
      <MainLeftSidePanel user={userLoginStatus} />
      <Box sx={{
        width: "100%",
        flex: 1,
      }}>
        <MainRightHeaderBar userDetails={userLoginStatus} />
        <Outlet />
      </Box>
    </Box>);
};

export default ProtectedRoute;
