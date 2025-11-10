import { Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";

const SnackbarCompo = ({
  successSnackbarOpen,
  handleSnackbarClose,
  snackbarContent,
  snackbarMode,
}) => {
  return (
    <Snackbar
      open={successSnackbarOpen}
      autoHideDuration={4000}
      onClose={() => handleSnackbarClose()}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <MuiAlert
        elevation={6}
        variant="filled"
        onClose={() => handleSnackbarClose()}
        severity={snackbarMode}
        sx={{ width: "100%" }}
      >
        {snackbarContent} !
      </MuiAlert>
    </Snackbar>
  );
};

export default SnackbarCompo;
