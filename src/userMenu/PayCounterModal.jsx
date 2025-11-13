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

const PayCounterModal = ({
  payHeaderText,
  payContent,
  payModal,
  setPayModal,
  loading,
  onYesOnlineHandle
}) => {
  const onYesHandle =()=>{
    if(payHeaderText === "Pay Online?"){
      onYesOnlineHandle();
    }else {
      setPayModal(false);
    }
  }

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
        <Typography fontWeight="bold">{payHeaderText}</Typography>
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
        <Typography fontSize={13}>{payContent}</Typography>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button
          variant="outlined"
          color="warning"
          onClick={() => setPayModal()}
          fullWidth
        >
          {payHeaderText === "Pay Online?" ? "No" : "close"}
        </Button>
        {
          payHeaderText === "Pay Online?" && <Button
          variant="contained"
          color="warning"
          onClick={() => onYesHandle()}
          sx={{ fontWeight: "bold" }}
          fullWidth
          disabled={loading}
        >
          yes
        </Button>
        }
        
      </DialogActions>
    </Dialog>
  );
};

export default PayCounterModal;
