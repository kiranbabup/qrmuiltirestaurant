// MainLeftSidePanel
import { Box, Popover, Typography, Button, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import { headerIconBGC, layoutLightGreenColor } from "../../data/contents";
import LsService, { storageKey } from "../../services/localstorage";
import SearchBar from "./SearchBar";
import { useSelector, useDispatch  } from "react-redux";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { removeNotification } from "../../store/notificationsSlice";

const MainRightHeaderBar = ({ userDetails }) => {
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const notificationsList = useSelector(
    (state) => state.notifications.notificationsList
  );
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const openNotif = Boolean(notifAnchorEl);
  const dispatch = useDispatch();

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotifClick = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleCloseNotif = () => {
    setNotifAnchorEl(null);
  };

  const onLogoutClick = () => {
    LsService.removeItem(storageKey);
    navigate("/");
  };

  const hasNotifications = notificationsList && notificationsList.length > 0;

  return (
    <Box
      sx={{
        height: "6vh",
        position: "fixed",
        p: 1,
        top: 0,
        right: 0,
        zIndex: 3,
        // bgcolor: "grey",
      }}
    >
      <Box sx={{ mr: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
        <Box
          sx={{
            backgroundColor: headerIconBGC,
            py: 1,
            px: 1.3,
            borderRadius: "10px",
            cursor: "pointer",
          }}
          //   onClick={(e) => handleNotifClick(e)}
        >
          <SettingsOutlinedIcon fontSize="small" />
        </Box>

        {/* Notification icon + dot */}
        <Box
          sx={{
            backgroundColor: headerIconBGC,
            py: 1,
            px: 1.3,
            borderRadius: "10px",
            cursor: "pointer",
            position: "relative",
          }}
          onClick={(e) => handleNotifClick(e)}
        >
          <NotificationsActiveOutlinedIcon fontSize="small" />
          {hasNotifications && (
            <FiberManualRecordIcon
              sx={{
                fontSize: 14,
                color: layoutLightGreenColor,
                position: "absolute",
                top: 6,
                right: 6,
              }}
            />
          )}
        </Box>
        {/* Notification popover */}
        <Popover
          open={openNotif}
          anchorEl={notifAnchorEl}
          onClose={handleCloseNotif}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          PaperProps={{
            sx: { p: 2, minWidth: 260, borderRadius: 3 },
          }}
        >
          <Typography fontWeight="bold" fontSize="1rem" mb={0.5}>
            Notifications
          </Typography>
          <Divider sx={{ my: 1 }} />

          {!hasNotifications ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                my: 3,
              }}
            >
              <NotificationsOffIcon sx={{ mb: 1 }} />
              <Typography fontSize="0.9rem" color="text.secondary">
                Currently No Notifications.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {notificationsList.map((item, idx) => (
                <Box key={idx}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight="bold" fontSize="0.95rem">
                        {item.notify_title}
                      </Typography>
                      <Typography
                        fontSize="0.85rem"
                        color="text.secondary"
                        sx={{ mt: 0.3 }}
                      >
                        {item.notify_content}
                      </Typography>
                    </Box>

                    <Tooltip title="Delete" placement="bottom" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation(); // don’t close popover
                          dispatch(removeNotification(idx));
                        }}
                        sx={{ mt: -0.5 }}
                      >
                        <CloseRoundedIcon fontSize="inherit" color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {idx !== notificationsList.length - 1 && (
                    <Divider sx={{ my: 1 }} />
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Popover>

        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
          onClick={(e) => handleAvatarClick(e)}
        >
          <Box
            sx={{
              width: 50,
              height: 50,
              bgcolor: layoutLightGreenColor,
              color: "#fff",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            {userDetails.role.slice(0, 1).toUpperCase()}
          </Box>
          <Box
            sx={{ display: "flex", flexDirection: "column", cursor: "pointer" }}
          >
            <span style={{ fontWeight: "bold", fontSize: 18 }}>
              {userDetails.username}
            </span>
            <span
              style={{
                fontSize: 12,
                color: "gray",
              }}
            >
              {userDetails.role}
            </span>
          </Box>
        </Box>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: { p: 2, minWidth: 220, borderRadius: 3 },
          }}
        >
          <Typography fontWeight="bold" fontSize="1rem" mb={0.5}>
            {userDetails.username}
          </Typography>
          <Typography fontSize="0.9rem" color="text.secondary" mb={1}>
            Role: {userDetails.role}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Button
            fullWidth
            variant="text"
            color="error"
            onClick={onLogoutClick}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              fontWeight: "bold",
            }}
            startIcon={<span style={{ fontSize: 18 }}>↩</span>}
          >
            Log out
          </Button>
        </Popover>
      </Box>
    </Box>
  );
};

export default MainRightHeaderBar;
