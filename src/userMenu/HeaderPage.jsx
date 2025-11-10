import belloso from "../data/images/belloso.png";
import { Box, Typography } from "@mui/material";
import TableBarOutlinedIcon from "@mui/icons-material/TableBarOutlined";
import { useNavigate } from "react-router-dom";

const HeaderPage = ({ tableID }) => {
  const nav =useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "70%",
          pl: 1,
        }}
      >
        <img
          src={belloso}
          alt="Cafe Belloso"
          style={{
            width: 44,
            height: 44,
            objectFit: "contain",
            padding: "5px",
          }}
        />
        <Typography>Cafe Belloso</Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderRadius: "4px",
          backgroundColor: "#e9e8e8",
          p: "5px 10px",
          mr: 1,
        }}
        onClick={() => nav("/my_order")}
      >
        <TableBarOutlinedIcon />
        <Typography sx={{ ml: 1, fontWeight: "bold" }}>{tableID}</Typography>
      </Box>
    </Box>
  );
};
export default HeaderPage;
