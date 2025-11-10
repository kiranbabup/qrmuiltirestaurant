import { Box } from "@mui/material";

const SmallScreenError = () => {
  return (
    <Box
      sx={{
        width: "100vw",
        display: { xs: "flex", md: "none" },
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "bold",
        textAlign: "center",
      }}
    >
      {/* Mobile View warning*/}
      Not compatible with small screens. Please use Laptop or PC - larger screen
      devices.
    </Box>
  );
};

export default SmallScreenError;
