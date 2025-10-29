import React from "react";
import belloso from "../data/images/belloso.png";
import { Box, Button } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate } from "react-router-dom";
import edge1 from "./edgeImages/edge_1.png";
import edge2 from "./edgeImages/edge_2.png";
import edge3 from "./edgeImages/edge_3.png";
import edge4 from "./edgeImages/edge_4.png";

const Page1 = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "100vw",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
        }}
      >
        Not compatible with large screens. Please use Mobile or smaller screen
        devices.
      </Box>

      <Box sx={{ width: "100vw", display: { xs: "flex", md: "none" } }}>
        <Box
          sx={{
            position: "fixed",
            zIndex: 1,
            top: 0,
            left: 0,
            width: "100%",
            height: "28vh",
            // backgroundColor: "grey",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box
          sx={{
            width: "30%",
          }}>
            <img src={edge1} alt="edge" style={{width:"100%", height:"100%"}}/>
          </Box>
          <Box sx={{
            width: "30%",
          }}>
            <img src={edge2} alt="edge" style={{width:"100%", height:"100%"}}/>
          </Box>
        </Box>
        <Box style={styles.page}>
          <Box
            sx={{
              width: { xs: "60%", sm: "35%" },
              background: "#ffffff",
              borderRadius: 6,
              padding: "28px 24px",
              boxShadow: "0 12px 30px rgba(18, 22, 28, 0.08)",
              textAlign: "center",
            }}
          >
            <img src={belloso} alt="Cafe Belloso" style={styles.logo} />
            <Box style={styles.title}>Cafe Belloso</Box>
            <Button
              variant="contained"
              color="warning"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                mt: 3,
                px: 4,
                py: 1.5,
                borderRadius: 4,
                fontWeight: "bold",
                textTransform: "none",
              }}
              onClick={() => navigate("/page2")}
            >
              Order Now
            </Button>
            
          </Box>
        </Box>
        <Box
          sx={{
            position: "fixed",
            zIndex: 1,
            bottom: 0,
            left: 0,
            width: "100%",
            height: "28vh",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box
          sx={{
            width: "30%",
          }}>
            <img src={edge3} alt="edge" style={{width:"100%", height:"100%"}}/>
          </Box>
          <Box sx={{
            width: "30%",
          }}>
            <img src={edge4} alt="edge" style={{width:"100%", height:"100%"}}/>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // soft pink background with subtle dot-like patterns
    background: "#fff9f8",
    //   "radial-gradient(circle at 10% 10%, rgba(255,140,120,0.06) 0 30px, transparent 31px), radial-gradient(circle at 90% 20%, rgba(255,140,120,0.04) 0 40px, transparent 41px), ",
  },
  card: {},
  logo: {
    width: 84,
    height: 84,
    objectFit: "contain",
    display: "block",
    margin: "0 auto",
    borderRadius: 8,
  },
  title: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: 600,
    color: "#222",
  },
  button: {
    marginTop: 18,
    background: "linear-gradient(180deg, #ff8a2b 0%, #f36b12 100%)",
    border: "none",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: 10,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(243,107,18,0.22)",
    fontSize: 15,
    fontWeight: 600,
  },
  icon: {
    marginLeft: 8,
    opacity: 0.95,
  },
};

export default Page1;
