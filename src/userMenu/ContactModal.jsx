import {
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  DialogActions,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import "./style.css";
import { dotContainerStyle, dotStyle } from "../data/styles";
import { useNavigate } from "react-router-dom";

const ContactModal = ({
  contactModal,
  setContactModal,
  name,
  setName,
  phone,
  setPhone,
  loading,
  setLoading,
  setSuccessSnackbarOpen,
  setsnackbarContent,
  setSnackbarMode,
  paybillHandle,
}) => {
  const [phoneError, setPhoneError] = useState("");
  const navigate = useNavigate();

  // Add validation function
  const validatePhone = (value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      setPhoneError("Mobile number can only contain numbers.");
      return false;
    }
    // Remove any validation error if input is valid
    setPhoneError("");
    return true;
  };

  const onCloseRegisterModal = () => {
    setName("");
    setPhone("");
    setContactModal(false);
  };

  const onContactHandle = () => {
    setLoading(true);

    if (name.trim().length < 4) {
      setSnackbarMode("error");
      setsnackbarContent("Name must be at least 4 characters long.");
      setSuccessSnackbarOpen(true);
      setLoading(false);
      return;
    }

    if (phone.trim().length < 10) {
      setSnackbarMode("error");
      setsnackbarContent("Mobile number should be 10 digits.");
      setSuccessSnackbarOpen(true);
      setLoading(false);
      return;
    }

    // Save contact
    localStorage.setItem("contactInfo", JSON.stringify({ name, phone }));

    // ✅ Re-check active status from localStorage right now
    let activeExists = false;
    try {
      const raw = localStorage.getItem("totalOrdersData");
      const list = raw ? JSON.parse(raw) : [];
      activeExists =
        Array.isArray(list) && list.some((o) => o?.active === true);
    } catch {}

    setSnackbarMode("success");
    setsnackbarContent("Information saved successfully");
    setSuccessSnackbarOpen(true);
    setLoading(false);

    onCloseRegisterModal();

    if (!activeExists) {
      // Create the first active order
      paybillHandle();
      return;
    }

    // If an active order already exists, just go to bill
    navigate("/bill");
  };

  return (
    <Dialog
      open={contactModal}
      onClose={() => setContactModal(false)}
      fullWidth
      sx={{ borderRadius: "10px" }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "10px",
        }}
      >
        <Typography fontWeight="bold">Contact Information</Typography>
        <IconButton
          onClick={() => onCloseRegisterModal()}
          size="small"
          sx={{ ":hover": { color: "crimson" } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box>
            <label>
              Name <span style={{ color: "crimson" }}>*</span>
            </label>
            <TextField
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mt: 1 }}
              fullWidth
              required
              inputProps={{
                maxLength: 25,
              }}
              onKeyPress={(e) => {
                // Prevent typing letters
                if (/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Box>
          <Box>
            <label>
              Mobile Number <span style={{ color: "crimson" }}>*</span>
            </label>
            <TextField
              placeholder="Enter Mobile Number"
              required
              value={phone}
              onChange={(e) => {
                const value = e.target.value;
                if (validatePhone(value)) {
                  setPhone(value);
                }
              }}
              onKeyPress={(e) => {
                // Prevent typing letters
                if (/[a-zA-Z]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              error={!!phoneError}
              helperText={phoneError}
              fullWidth
              sx={{ mt: 1 }}
              InputProps={{
                startAdornment: (
                  <Box
                    component="span"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    +91
                    <span
                      style={{
                        margin: "0px 3px",
                        color: "gray",
                        fontSize: "25px",
                      }}
                    >
                      |
                    </span>
                  </Box>
                ),
              }}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                maxLength: 10,
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button
          variant="outlined"
          color="warning"
          onClick={() => onCloseRegisterModal()}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          fullWidth
          onClick={() => onContactHandle()}
          sx={{ fontWeight: "bold" }}
          disabled={loading || !name.trim() || !phone.trim()}
        >
          {loading ? (
            <Box sx={{ ...dotContainerStyle }}>
              <Box sx={{ ...dotStyle, animationDelay: "0s" }}></Box>
              <Box sx={{ ...dotStyle, animationDelay: "0.2s" }}></Box>
              <Box sx={{ ...dotStyle, animationDelay: "0.4s" }}></Box>
              <Box sx={{ ...dotStyle, animationDelay: "0.6s" }}></Box>
              <Box sx={{ ...dotStyle, animationDelay: "0.8s" }}></Box>
            </Box>
          ) : (
            "Confirm"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactModal;
