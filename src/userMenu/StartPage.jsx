import {
  Box,
  Typography,
  Button,
} from "@mui/material";
import {
  page3BGColor,
} from "../data/contents/items";
import { useNavigate } from "react-router-dom";
import namaste from "./pageImages/namaste.svg";

const StartPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Large screen warning */}
      {/* <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "100vw",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          textAlign: "center",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Typography>
          Not compatible with large screens. Please use mobile or smaller-screen devices.
        </Typography>
        <Typography>
          Or if you are not a customer,{" "}
          <Button
            variant="text"
            onClick={() => navigate("/login")}
            sx={{ textTransform: "none", fontWeight: "bold", ml: 0.5 }}
          >
            Click Me
          </Button>{" "}
          to login.
        </Typography>
       </Box> */}

      {/* Mobile View */}
      <Box sx={{ width: "100vw", height:"100vh", display: { xs: "flex", md: "none" } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            backgroundColor: page3BGColor,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={namaste}
              alt="namaste"
              style={{ width: "45%", marginBottom: "1rem" }}
            />
            <Typography sx={{ fontWeight: "bold", my: 1 }}>
              Welcome!
            </Typography>
            <Typography sx={{ color: "grey", textAlign: "center", px: "10%" }}>
              Please scan the QR at the restaurant table.
            </Typography>
            <Box p={2} />
            {/* <Button
              variant="contained"
              color="warning"
              sx={{ textTransform: "none" }}
              onClick={() => navigate("/menu")}
            >
              View Your Orders
            </Button> */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default StartPage;