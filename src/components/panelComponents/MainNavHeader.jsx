// MainLeftSidePanel
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import WestOutlinedIcon from "@mui/icons-material/WestOutlined";
import { layoutLightGreenColor } from "../../data/contents";

const MainNavHeader = ({
  headerTitle,
  headerNavStartTitle,
  homeNavigate,
  headerNavEndTitle,
}) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        // height: "6vh",
        p: 1,
        ml: 3,
        mb: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <WestOutlinedIcon
          sx={{ cursor: "pointer" }}
          //  onClick={}
        />
        <Typography sx={{ fontWeight: "bold", fontSize: 20 }}>
          {headerTitle}
        </Typography>
      </Box>
      <Box>
        <span
          style={{
            color: layoutLightGreenColor,
            fontSize: 12,
            cursor: "pointer",
          }}
          onClick={() => navigate(homeNavigate)}
        >
          {headerNavStartTitle}
        </span>{" "}
        {headerNavEndTitle && (
          <span
            style={{
              fontSize: 12,
            }}
          >
            / {headerNavEndTitle}
          </span>
        )}
      </Box>
    </Box>
  );
};

export default MainNavHeader;
