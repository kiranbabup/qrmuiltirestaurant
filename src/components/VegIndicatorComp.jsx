import { Box } from "@mui/material";

const VegIndicatorComp = (type) => {
  // console.log(type);
  
  return (
    <Box>
      {type.type === "vegan" ? (
        <Box
          sx={{
            width: "12px",
            height: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid green",
            borderRadius: "2px",
          }}
        >
          <Box
            sx={{
              width: "8px",
              height: "8px",
              backgroundColor: "green",
              borderRadius: "50%",
            }}
          ></Box>
        </Box>
      ) : (
        <Box
          sx={{
            width: "12px",
            height: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid crimson",
            borderRadius: "2px",
          }}
        >
          <Box
            sx={{
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderBottom: "7px solid crimson", // triangle color
              display: "inline-block",
            }}
            aria-hidden="true"
          ></Box>
        </Box>
      )}
    </Box>
  );
};
export default VegIndicatorComp;
