import { useState } from "react";
import { Box } from "@mui/material";
import MainNavHeader from "../../../components/panelComponents/MainNavHeader";
import LeftComponent from "../superComponents/LeftComponent";
import RightComponent from "../superComponents/RightComponent";
import { projectBackgroundColor } from "../../../data/contents";

const EmployeeRegistraionOne = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const leftTitleOne = "Personal & Contact Information";
  const leftTitleTwo = "Location details";
  const leftTitleThree = "Documents";

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return leftTitleOne;
      case 2:
        return leftTitleTwo;
      case 3:
      default:
        return leftTitleThree;
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          width: "100%",
          bgcolor: projectBackgroundColor,
          position: "sticky",
          zIndex: 1,
          borderBottom: "1px solid #E4E7EC",
          top: 0,
          height: "fit-content",
        }}
      >
        <MainNavHeader
          headerTitle="Add New Restaurant"
          headerNavStartTitle="Home / Restaurant Register"
          homeNavigate="/super_admin"
          headerNavEndTitle="Add New Restaurant"
        />
      </Box>

      {/* main white paper */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 0, height: 0 },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <Box
          sx={{
            width: "100%",
            p: 2,
          }}
        >
          <Box
            sx={{
              width: "100%",
              // maxWidth: 1200,
              mx: "auto",
              bgcolor: "white",
              borderRadius: 3,
              boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
              display: "flex",
              minHeight: 520,
            }}
          >
            {/* LEFT PANEL */}
            <LeftComponent
              headLeftCompTitle="Register New Restaurant"
              leftHeadContent="Enter all required details to formally add a new restaurant to your organization."
              leftTitleOne={leftTitleOne}
              leftTitleTwo={leftTitleTwo}
              leftTitleThree={leftTitleThree}
              currentStep={currentStep}
            />

            {/* RIGHT PANEL */}
            <RightComponent
              step={currentStep}
              onStepChange={setCurrentStep}
              headLeftCompTitle={getStepTitle()}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeRegistraionOne;
