import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Select,
  MenuItem,
} from "@mui/material";
import FormHeadComponent from "./FormHeadComponent";
import {
  countryCodes,
  layoutDarkGreenColor,
  layoutLightGreenColor,
  projectBackgroundColor,
} from "../../../data/contents";
import { useDispatch } from "react-redux";
import { addNotification } from "../../../store/notificationsSlice";

const baseButtonSx = {
  textTransform: "none",
  borderRadius: 999,
  px: 3,
  py: 1,
  fontWeight: "bold",
  fontSize: 14,
  color: layoutDarkGreenColor,
};

const loadLS = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
};

const saveLS = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const clearLS = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

/**
 * STEP 1 FORM – Personal / Contact style
 * localStorage key: reg_rest_one
 */
const StepOneForm = ({ onNext }) => {
  const initial = {
    fullName: "",
    dob: "",
    gender: "male",
    email: "",
    phoneCode: "+91",
    phoneNumber: "",
    address: "",
    emergencyName: "",
    emergencyPhoneCode: "+91",
    emergencyPhoneNumber: "",
  };

  const [values, setValues] = useState(initial);
  const dispatch = useDispatch();

  useEffect(() => {
    setValues(loadLS("reg_rest_one", initial));
  }, []);

  const handleChange = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    saveLS("reg_rest_one", values);
    if (onNext) onNext(false); // false = stay on same step
  };

  const handleNext = () => {
    saveLS("reg_rest_one", values);
    dispatch(
      addNotification({
        notify_title: "Notification One",
        notify_content: "Register 1st step saved successfully.",
      })
    );
    if (onNext) onNext(true); // true = advance
  };

  const handleDiscard = () => {
    setValues(initial);
    clearLS("reg_rest_one");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
        gap: 2,
      }}
    >
      <Box>
        <FormHeadComponent
          step="1"
          formHeadCompTitle="Personal & Contact Information"
          formHeadCompContent="Enter the restaurant’s primary contact person information."
        />
        {/* Personal Info */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 1 }}>
          Personal Info
        </Typography>
        <Grid container spacing={2}>
          {/* <Grid item xs={12} md={6}> */}
          <Grid item sx={{ backgroundColor: projectBackgroundColor }} size={6}>
            <TextField
              fullWidth
              label="Full Name"
              size="small"
              value={values.fullName}
              onChange={handleChange("fullName")}
            />
          </Grid>
          <Grid item sx={{ backgroundColor: projectBackgroundColor }} size={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              size="small"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={values.dob}
              onChange={handleChange("dob")}
            />
          </Grid>
        </Grid>
        <Typography variant="subtitle2" sx={{ mt: 1.4, color: "grey" }}>
          Gender
        </Typography>
        <Grid container spacing={2}>
          {["male", "female", "prefer_not_to_say"].map((genderOption) => (
            <Grid
              key={genderOption}
              item
              size="auto"
              sx={{
                flex: "1 1 auto",
                minWidth: 150,
              }}
            >
              <Box
                onClick={() =>
                  setValues((prev) => ({ ...prev, gender: genderOption }))
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  border: `2px solid ${
                    values.gender === genderOption
                      ? layoutLightGreenColor
                      : "#e0e0e0"
                  }`,
                  backgroundColor: projectBackgroundColor,
                  // values.gender === genderOption ? "#f0fdf4" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: layoutLightGreenColor,
                    backgroundColor:
                      values.gender === genderOption ? "#f0fdf4" : "#fafafa",
                  },
                }}
              >
                <label
                  style={{
                    cursor: "pointer",
                    fontWeight: values.gender === genderOption ? 600 : 500,
                    color:
                      values.gender === genderOption
                        ? layoutLightGreenColor
                        : "rgba(0,0,0,0.6)",
                    fontSize: "14px",
                  }}
                >
                  {genderOption === "male"
                    ? "Male"
                    : genderOption === "female"
                    ? "Female"
                    : "Prefer not to say"}
                </label>
                <input
                  type="radio"
                  name="gender"
                  value={genderOption}
                  checked={values.gender === genderOption}
                  onChange={() => handleChange("gender")}
                  style={{
                    cursor: "pointer",
                    accentColor: layoutLightGreenColor,
                    width: 18,
                    height: 18,
                    // margin:1,
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
        {/* Contact Info */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
          Contact Info
        </Typography>
        <Grid container spacing={2}>
          <Grid item sx={{ backgroundColor: projectBackgroundColor }} size={6}>
            <TextField
              fullWidth
              label="Email Address"
              placeholder="e.g. 221B Baker Street, London, NW16XE"
              size="small"
              value={values.email}
              onChange={handleChange("email")}
            />
          </Grid>
          <Grid
            item
            sx={{ backgroundColor: projectBackgroundColor }}
            size={1.5}
          >
            <Select
              fullWidth
              size="small"
              value={values.phoneCode}
              onChange={handleChange("phoneCode")}
              displayEmpty
              sx={{ "& .MuiSelect-select": { padding: "10px 12px" } }}
            >
              {countryCodes.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.code}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid
            item
            sx={{ backgroundColor: projectBackgroundColor }}
            size={4.5}
          >
            <TextField
              fullWidth
              label="Phone Number"
              size="small"
              value={values.phoneNumber}
              onChange={handleChange("phoneNumber")}
            />
          </Grid>
          <Grid item sx={{ backgroundColor: projectBackgroundColor }} size={12}>
            <TextField
              fullWidth
              label="Address"
              size="small"
              value={values.address}
              onChange={handleChange("address")}
              multiline
              rows={2}
              //   disabled={loading}
            />
          </Grid>
        </Grid>
        {/* Emergency Contact */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
          Emergency Contact
        </Typography>
        <Grid container spacing={2}>
          <Grid item sx={{ backgroundColor: projectBackgroundColor }} size={6}>
            <TextField
              fullWidth
              label="Name"
              size="small"
              value={values.emergencyName}
              onChange={handleChange("emergencyName")}
            />
          </Grid>
          <Grid
            item
            sx={{ backgroundColor: projectBackgroundColor }}
            size={1.5}
          >
            <Select
              fullWidth
              size="small"
              value={values.emergencyPhoneCode}
              onChange={handleChange("emergencyPhoneCode")}
              displayEmpty
              sx={{ "& .MuiSelect-select": { padding: "10px 12px" } }}
            >
              {countryCodes.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.code}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid
            item
            sx={{ backgroundColor: projectBackgroundColor }}
            size={4.5}
          >
            <TextField
              fullWidth
              label="Phone Number"
              size="small"
              value={values.emergencyPhoneNumber}
              onChange={handleChange("emergencyPhoneNumber")}
            />
          </Grid>
        </Grid>
      </Box>

      <Box>
        {/* Actions */}
        <Divider sx={{ m:1 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              // variant="outlined"
              sx={baseButtonSx}
              onClick={handleSave}
            >
              Save as Draft
            </Button>
            <Button
              variant="text"
              sx={{
                ...baseButtonSx,
                // color: "#6B7280"
              }}
              onClick={handleDiscard}
            >
              Discard
            </Button>
          </Box>

          <Button
            variant="contained"
            sx={{
              ...baseButtonSx,
              bgcolor: layoutLightGreenColor,
              color: "white",
              "&:hover": { bgcolor: layoutDarkGreenColor },
            }}
            onClick={handleNext}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Box>
    // </>
  );
};

/**
 * STEP 2 FORM – Location details
 * localStorage key: reg_rest_two
 */
const StepTwoForm = ({ onNext, onPrev }) => {
  const initial = {
    restaurantName: "",
    branchCode: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  };

  const [values, setValues] = useState(initial);
  const dispatch = useDispatch();

  useEffect(() => {
    setValues(loadLS("reg_rest_two", initial));
  }, []);

  const handleChange = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    saveLS("reg_rest_two", values);
    if (onNext) onNext(false);
  };

  const handleNext = () => {
    saveLS("reg_rest_two", values);
    dispatch(
      addNotification({
        notify_title: "Notification two",
        notify_content: "Register 2nd step saved successfully.",
      })
    );
    if (onNext) onNext(true);
  };

  const handleDiscard = () => {
    setValues(initial);
    clearLS("reg_rest_two");
  };

  return (
    <>
      <FormHeadComponent
        step="2"
        formHeadCompTitle="Location details"
        formHeadCompContent="Provide essential information about where the restaurant is located."
      />

      <Grid container spacing={2}>
        <Grid
          item
          sx={{ backgroundColor: projectBackgroundColor }}
          xs={12}
          md={6}
        >
          <TextField
            fullWidth
            label="Restaurant Name"
            size="small"
            value={values.restaurantName}
            onChange={handleChange("restaurantName")}
          />
        </Grid>
        <Grid
          item
          sx={{ backgroundColor: projectBackgroundColor }}
          xs={12}
          md={6}
        >
          <TextField
            fullWidth
            label="Branch Code / Identifier"
            size="small"
            value={values.branchCode}
            onChange={handleChange("branchCode")}
          />
        </Grid>
        <Grid
          item
          sx={{ backgroundColor: projectBackgroundColor }}
          xs={12}
          md={4}
        >
          <TextField
            fullWidth
            label="City"
            size="small"
            value={values.city}
            onChange={handleChange("city")}
          />
        </Grid>
        <Grid
          item
          sx={{ backgroundColor: projectBackgroundColor }}
          xs={12}
          md={4}
        >
          <TextField
            fullWidth
            label="State / Province"
            size="small"
            value={values.state}
            onChange={handleChange("state")}
          />
        </Grid>
        <Grid
          item
          sx={{ backgroundColor: projectBackgroundColor }}
          xs={12}
          md={4}
        >
          <TextField
            fullWidth
            label="Country"
            size="small"
            value={values.country}
            onChange={handleChange("country")}
          />
        </Grid>
        <Grid
          item
          sx={{ backgroundColor: projectBackgroundColor }}
          xs={12}
          md={4}
        >
          <TextField
            fullWidth
            label="Postal Code"
            size="small"
            value={values.postalCode}
            onChange={handleChange("postalCode")}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mt: 4, mb: 2 }} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" sx={baseButtonSx} onClick={handleSave}>
            Save as Draft
          </Button>
          <Button
            variant="text"
            sx={{ ...baseButtonSx, color: "#6B7280" }}
            onClick={handleDiscard}
          >
            Discard
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" sx={baseButtonSx} onClick={onPrev}>
            Previous
          </Button>
          <Button
            variant="contained"
            sx={{
              ...baseButtonSx,
              bgcolor: "#16A34A",
              "&:hover": { bgcolor: "#15803D" },
            }}
            onClick={handleNext}
          >
            Next
          </Button>
        </Box>
      </Box>
    </>
  );
};

/**
 * STEP 3 FORM – Documents / final
 * localStorage key: reg_rest_three
 */
const StepThreeForm = ({ onPrev }) => {
  const initial = {
    hasLicense: "",
    hasFireCertificate: "",
    notes: "",
  };

  const [values, setValues] = useState(initial);
  const dispatch = useDispatch();

  useEffect(() => {
    setValues(loadLS("reg_rest_three", initial));
  }, []);

  const handleChange = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = () => {
    saveLS("reg_rest_three", values);
    dispatch(
      addNotification({
        notify_title: "Notification Three",
        notify_content: "Register 3rd step saved successfully.",
      })
    );
  };

  const handleSubmit = () => {
    saveLS("reg_rest_three", values);
    dispatch(
      addNotification({
        notify_title: "Notification Submit",
        notify_content: "Registration Submitted successfully.",
      })
    );
    // here you can later call API, etc.
    // For now we just persist & maybe show snackbar in real app.
  };

  const handleDiscard = () => {
    setValues(initial);
    clearLS("reg_rest_three");
  };

  return (
    <>
      <FormHeadComponent
        step="3"
        formHeadCompTitle="Documents"
        formHeadCompContent="Attach or describe the mandatory documents required for this restaurant."
      />

      <Grid container spacing={2}>
        <Grid
          item
          sx={{ backgroundColor: projectBackgroundColor }}
          xs={12}
          md={6}
        >
          <TextField
            fullWidth
            label="Business License / Number"
            size="small"
            value={values.hasLicense}
            onChange={handleChange("hasLicense")}
          />
        </Grid>
        <Grid
          item
          sx={{ backgroundColor: projectBackgroundColor }}
          xs={12}
          md={6}
        >
          <TextField
            fullWidth
            label="Fire & Safety Certificate"
            size="small"
            value={values.hasFireCertificate}
            onChange={handleChange("hasFireCertificate")}
          />
        </Grid>
        <Grid item sx={{ backgroundColor: projectBackgroundColor }} xs={12}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Additional Notes"
            size="small"
            value={values.notes}
            onChange={handleChange("notes")}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mt: 4, mb: 2 }} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" sx={baseButtonSx} onClick={handleSave}>
            Save as Draft
          </Button>
          <Button
            variant="text"
            sx={{ ...baseButtonSx, color: "#6B7280" }}
            onClick={handleDiscard}
          >
            Discard
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" sx={baseButtonSx} onClick={onPrev}>
            Previous
          </Button>
          <Button
            variant="contained"
            sx={{
              ...baseButtonSx,
              bgcolor: "#16A34A",
              "&:hover": { bgcolor: "#15803D" },
            }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </>
  );
};

const RightComponent = ({ step, onStepChange }) => {
  const goNext = (advance) => {
    if (advance) {
      onStepChange(Math.min(3, step + 1));
    }
  };

  const goPrev = () => {
    onStepChange(Math.max(1, step - 1));
  };

  return (
    <Box
      sx={{
        flex: 1,
        py: 2,
        px: 12,
        borderRadius: "0 24px 24px 0",
      }}
    >
      {step === 1 && <StepOneForm onNext={goNext} />}
      {step === 2 && <StepTwoForm onNext={goNext} onPrev={goPrev} />}
      {step === 3 && <StepThreeForm onPrev={goPrev} />}
    </Box>
  );
};

export default RightComponent;
