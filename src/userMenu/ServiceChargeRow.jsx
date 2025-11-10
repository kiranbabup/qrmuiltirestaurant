import { useState, useMemo } from "react";
import { Box, Typography, IconButton, TextField, Slider } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";

const ServiceChargeRow = ({ subTotalNum, initialCharge = 50, onChange }) => {
  const subtotal = Number(subTotalNum) || 0;
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(Number(initialCharge) || 0);

  // percent of subtotal this amount represents
  const percent = useMemo(() => {
    if (subtotal <= 0) return 0;
    const p = (Number(amount) / subtotal) * 100;
    return Math.max(0, Math.min(100, isFinite(p) ? p : 0));
  }, [amount, subtotal]);

  const handleAmountInput = (e) => {
    // keep numeric with single dot
    const v = e.target.value.replace(/[^\d.]/g, "");
    const safe = v.split(".").slice(0, 2).join(".");
    setAmount(safe === "" ? 0 : Number(safe));
  };

  const handlePercentChange = (_e, value) => {
    // Slider returns 0..100; convert to amount
    const p = Array.isArray(value) ? value[0] : value;
    const newAmount = subtotal > 0 ? (subtotal * p) / 100 : 0;
    setAmount(Number(newAmount.toFixed(2)));
  };

  const save = () => {
    setEditing(false);
    if (onChange) onChange(amount);
  };

  const cancel = () => setEditing(false);

  return (
    <Box sx={{ display: "grid", rowGap: 1 }}>
      {/* Row: label | edit | value */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          alignItems: "center",
          columnGap: 1,
        }}
      >
        <Typography>Service Charge</Typography>

        <IconButton
          aria-label="edit service charge"
          onClick={() => setEditing(true)}
          size="small"
        >
          <EditIcon fontSize="small" />
        </IconButton>

        <Typography>₹ {Number(amount).toFixed(2)}</Typography>
      </Box>

      {/* Edit area (shown only when editing) */}
      {editing && (
        <Box sx={{ display: "grid", rowGap: 1, }}>
          {/* TextField + Save + Cancel */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <TextField
              size="small"
              value={Number.isNaN(amount) ? "" : amount}
              onChange={handleAmountInput}
              inputProps={{ inputMode: "decimal", pattern: "[0-9.]*", min: 0 }}
              sx={{ width: 140 }}
            />

            <IconButton
              color="success"
              aria-label="save"
              onClick={save}
              size="small"
            >
              <CheckCircleOutlineIcon />
            </IconButton>

            <IconButton
              aria-label="cancel"
              color="error"
              onClick={cancel}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Editable ProgressBar -> Slider */}
          <Box sx={{ px: 0.5 }}>
            <Slider
              value={percent}
              onChange={handlePercentChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v.toFixed(2)}%`}
              min={0}
              max={100}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: -1,
                fontSize: 12,
                opacity: 0.8,
              }}
            >
              <Typography sx={{ fontSize: 12 }}>0%</Typography>
              <Typography sx={{ fontSize: 12 }}>
                {percent.toFixed(2)}% of ₹ {subtotal.toFixed(2)}
              </Typography>
              <Typography sx={{ fontSize: 12 }}>100%</Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ServiceChargeRow;
