import { useState } from "react";
import { Box } from "@mui/material";
import MainNavHeader from "../../../components/panelComponents/MainNavHeader";
import LeftComponent from "../superComponents/LeftComponent";
import SmallScreenError from "../../../components/panelComponents/SmallScreenError";
import {
  headerBoxStyle,
  lrgScreenStyle,
  rightInnerBoxStyle,
} from "../../../components/panelComponents/panelStyles";
import RestaurantRegistrationRightComp from "./RestaurantRegistrationRightComp";

const RestaurantRegistraionMainPage = () => {
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
    <Box>
      {/* Large screen view */}
      <Box sx={lrgScreenStyle}>
        <Box sx={headerBoxStyle}>
          <MainNavHeader
            headerTitle="Add New Restaurant"
            headerNavStartTitle="Home / Restaurant Register"
            homeNavigate="/super_admin"
            headerNavEndTitle="Add New Restaurant"
          />
        </Box>

        <Box sx={rightInnerBoxStyle}>
          <Box
            sx={{
              width: "96%",
              p: 2,
            }}
          >
            {/* main white paper */}
            <Box
              sx={{
                width: "100%",
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
              <RestaurantRegistrationRightComp
                step={currentStep}
                onStepChange={setCurrentStep}
                headLeftCompTitle={getStepTitle()}
              />
            </Box>
          </Box>
        </Box>
      </Box>
      {/* Mobile View warning*/}
      <SmallScreenError />
    </Box>
  );
};

export default RestaurantRegistraionMainPage;
