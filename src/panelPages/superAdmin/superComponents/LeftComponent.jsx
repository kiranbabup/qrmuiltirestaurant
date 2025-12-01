import { Box, Divider, Typography } from "@mui/material";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { layoutLightGreenColor } from "../../../data/contents";

const StepDot = ({ active, completed }) => {
  if (completed) {
    return (
      <CheckCircleIcon
        sx={{
          fontSize: 18,
          color: layoutLightGreenColor,
        }}
      />
    );
  }

  if (active) {
    return (
      <FiberManualRecordIcon
        sx={{
          fontSize: 20,
          color: layoutLightGreenColor,
        }}
      />
    );
  }

  return (
    <RadioButtonUncheckedIcon
      sx={{
        fontSize: 18,
        color: "#D0D4DC",
      }}
    />
  );
};

const LeftComponent = ({
  headLeftCompTitle,
  leftHeadContent,
  leftTitleOne,
  leftTitleTwo,
  leftTitleThree,
  currentStep = 1,
}) => {
  const steps = [leftTitleOne, leftTitleTwo, leftTitleThree];

  return (
    <Box
      sx={{
        width: 220,
        borderRight: "1px solid #E4E7EC",
        p: 3,
        bgcolor: "#F8FAFB",
        borderRadius: "12px 0 0 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {/* Header left */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {headLeftCompTitle}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 1, color: "#6F7683", lineHeight: 1.5, fontSize: "12px" }}
        >
          {leftHeadContent}
        </Typography>
        <Divider sx={{ my: 1 }} />
      </Box>

      {/* Steps */}
      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 4 }}>
        {steps.map((label, index) => {
          const stepIdx = index + 1;
          const active = currentStep === stepIdx;
          const completed = currentStep > stepIdx;

          return (
            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                alignItems: "start",
                gap: 2,
              }}
              key={label}
            >
              <Box
                sx={{
                  height: 45,
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "center",
                  pt: "2px",
                }}
              >
                <StepDot active={active} completed={completed} />
              </Box>

                <Typography
                //   variant="body2"
                  sx={{
                    fontWeight: active ? 600 : 500,
                    color: active ? "#111827" : "#6B7280",
                    flex: 1,
                  }}
                >
                  {label}
                </Typography>

              {/* Vertical line */}
              {stepIdx < steps.length && (
                <Box
                  sx={{
                    position: "absolute",
                    zIndex: -1,
                    ml: "7px",
                    mt: "18px",
                    width: 4,
                    height: 68,
                    bgcolor:
                      currentStep > stepIdx ? layoutLightGreenColor : "#E5E7EB",
                    borderRadius: 999,
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default LeftComponent;
