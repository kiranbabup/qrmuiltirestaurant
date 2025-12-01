import { Box, Divider, Typography } from "@mui/material";

const FormHeadComponent = ({
  step,
  formHeadCompTitle,
  formHeadCompContent,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="caption"
        sx={{ color: "#9CA3AF", fontWeight: 500, letterSpacing: 0.5, mb:1 }}
      >
        Step {step}/3
      </Typography>

      <Typography
        variant="h6"
        sx={{ mt: 0.5, fontWeight: 600, color: "#111827" }}
      >
        {formHeadCompTitle}
      </Typography>

      {formHeadCompContent && (
        <Typography
          variant="body2"
          sx={{ mt: 0.5, color: "#6B7280", maxWidth: 520 }}
        >
          {formHeadCompContent}
        </Typography>
      )}
      <Divider sx={{ my: 1 }} />
    </Box>
  );
};

export default FormHeadComponent;
