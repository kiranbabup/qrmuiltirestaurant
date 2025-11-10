import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  DialogActions,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const PayCounterModal = ({ payModal, setPayModal, loading, onYesHandle }) => {
  return (
    <Dialog
      open={payModal}
      onClose={() => setPayModal(false)}
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
        <Typography fontWeight="bold">Pay At Counter?</Typography>
        <IconButton
          onClick={() => setPayModal()}
          size="small"
          sx={{ ":hover": { color: "crimson" } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Typography fontSize={13}>
          You'll need to check with the biller at the counter to pay. Do you
          wish to proceed?
        </Typography>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button
          variant="outlined"
          color="warning"
          onClick={() => setPayModal()}
          fullWidth
        >
          No
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => onYesHandle()}
          sx={{ fontWeight: "bold" }}
          fullWidth
          disabled={loading}
        >
          yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PayCounterModal;
