import React from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { layoutDarkGreenColor } from "../data/contents";

const ConfirmationComponent = ({
  open,
  title = "Confirm",
  message = "",
  onConfirm,
  // onCancel,
  // onClose,
  handleClose,
  loading,
  confirmText = "Yes",
  cancelText = "No",
  fullWidth = true,
  maxWidth = "xs",
  color,
}) => {
  // const handleClose = () => {
  //   if (onClose) onClose();
  //   else if (onCancel) onCancel();
  // };

  return (
    <Dialog
      open={!!open}
      onClose={handleClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      aria-labelledby="confirmation-dialog-title"
    >
      <DialogTitle id="confirmation-dialog-title" sx={{ m: 0, p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <IconButton aria-label="close" onClick={handleClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {typeof message === "string" ? (
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        ) : (
          message
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="text"
          color="warning"
          sx={{ textTransform: "none", color: color, ":hover": { color: color && layoutDarkGreenColor } }}
        >
          {cancelText}
        </Button>

        <Button
          variant="contained"
          onClick={onConfirm}
          color="warning"
          disabled={loading}
          sx={{ textTransform: "none", backgroundColor: color, position: "relative", ":hover": { backgroundColor: color && layoutDarkGreenColor } }}
        >
          {loading && (
            <CircularProgress
              size={18}
              color="inherit"
              sx={{ position: "absolute", left: 12 }}
            />
          )}
          <Box component="span" sx={{ pl: loading ? 2 : 0 }}>
            {confirmText}
          </Box>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ConfirmationComponent.propTypes = {
//   open: PropTypes.bool,
//   title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
//   message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
//   onConfirm: PropTypes.func,
//   onCancel: PropTypes.func,
//   onClose: PropTypes.func,
//   loading: PropTypes.bool,
//   confirmText: PropTypes.string,
//   cancelText: PropTypes.string,
//   fullWidth: PropTypes.bool,
//   maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
// };

export default ConfirmationComponent;
