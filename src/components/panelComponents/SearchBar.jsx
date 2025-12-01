import { Box, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function SearchBar({ value, onChange, placeholder = "Search anything" }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 2,
        py: 0.75,
        borderRadius: "10px",           // full pill
        bgcolor: "white",
        boxShadow: "0 0 0 1px #edf0f2",  // very light border
      }}
    >
      <SearchIcon sx={{ mr: 1, color: "text.secondary", fontSize: 22 }} />
      <InputBase
        fullWidth
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        sx={{
          fontSize: 14,
          color: "text.primary",
          "&::placeholder": {
            color: "text.secondary",
            opacity: 1,
          },
        }}
      />
    </Box>
  );
}

export default SearchBar;
