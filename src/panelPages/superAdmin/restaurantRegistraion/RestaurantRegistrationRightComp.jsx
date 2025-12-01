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
import FormHeadComponent from "../superComponents/FormHeadComponent";
import {
  countryCodes,
  layoutDarkGreenColor,
  layoutLightGreenColor,
  projectBackgroundColor,
} from "../../../data/contents";
import { useDispatch } from "react-redux";
import { addNotification } from "../../../store/notificationsSlice";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, set, useForm } from "react-hook-form";
import RHFTextField from "../../../components/RHFTextField";
import { maxDobStr, minDobStr } from "../../../data/functions";
import ConfirmationComponent from "../../../components/ConfirmationComponent";
import { useNavigate } from "react-router-dom";
import { createRestaurants } from "../../../services/api";

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

const getLS = (key, value) => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
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
  const [submitting, setSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const schemaA = Yup.object().shape({
    restaurantHeadName: Yup.string()
      .transform((v) => (v ?? "").trim())
      .min(2, "Name must be at least 2 characters")
      .required("Name is required"),
    head_dob: Yup.string()
      .required("Date of Birth is required")
      .test(
        "dob-range",
        `Please enter DOB between ${minDobStr} and ${maxDobStr}`,
        (val) => {
          if (!val) return false;
          const d = new Date(val);
          const minD = new Date(minDobStr);
          const maxD = new Date(maxDobStr);
          // invalid date -> fail
          if (Number.isNaN(d.getTime())) return false;
          return d >= minD && d <= maxD;
        }
      ),
    email: Yup.string()
      .transform((v) => (v ?? "").trim())
      .email("Enter a valid email")
      .required("Email is required"),
    phoneNumber: Yup.string()
      .transform((v) => (v ?? "").trim())
      .required("Phone number is required")
      .matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
    head_address: Yup.string()
      .transform((v) => (v ?? "").trim())
      .required("Address is required"),
    emergencyName: Yup.string()
      .transform((v) => (v ?? "").trim())
      .required("Name is required"),
    emergencyPhoneNumber: Yup.string()
      .transform((v) => (v ?? "").trim())
      .required("Phone number is required")
      .matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  });

  const initialA = {
    restaurantHeadName: "",
    head_dob: "",
    email: "",
    phoneCode: "+91",
    phoneNumber: "",
    gender: "male",
    head_address: "",
    emergencyName: "",
    emergencyPhoneCode: "+91",
    emergencyPhoneNumber: "",
  };

  const methodsA = useForm({
    resolver: yupResolver(schemaA),
    defaultValues: initialA,
  });

  const { handleSubmit, reset } = methodsA;
  const [valuesA, setValuesA] = useState(initialA);
  const dispatch = useDispatch();

  useEffect(() => {
    const draft = functionIsDraft();
    setIsDraft(Boolean(draft && Object.keys(draft).length > 0));
  }, []);

  useEffect(() => {
    const ls = loadLS("reg_rest_one", initialA);
    setValuesA(ls);
    reset(ls);
  }, [reset]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setValuesA((prev) => ({ ...prev, [field]: value }));
  };

  const functionIsDraft = () => {
    const draftAvail = getLS("reg_rest_one");
    return draftAvail || null;
  };

  const handleSave = () => {
    const formValuesA = methodsA.getValues();
    saveLS("reg_rest_one", { ...valuesA, ...formValuesA });
    setIsDraft(true);
    if (onNext) onNext(false); // false = stay on same step
  };

  const handleGetDraft = () => {
    const draft = getLS("reg_rest_one");
    if (draft && Object.keys(draft).length > 0) {
      setValuesA(draft);
      reset(draft);
      setIsDraft(true);
    } else {
      // no draft found — clear draft state
      setIsDraft(false);
    }
  };

  const handleNext = () => {
    setSubmitting(true);

    try {
      const formValuesA = methodsA.getValues();
      saveLS("reg_rest_one", { ...valuesA, ...formValuesA });
      setIsDraft(true);

      dispatch(
        addNotification({
          notify_title: "Restaurant Registraion",
          notify_content: "Register 1st step saved successfully.",
        })
      );
      if (onNext) onNext(true);
    } catch (err) {
      console.error("Error creating account:", err);
      alert(
        // err.response.data?.message ??
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscard = () => {
    reset(initialA);
    setValuesA(initialA);
    clearLS("reg_rest_one");
    setIsDraft(false);
  };

  return (
    <FormProvider {...methodsA}>
      <Box
        component="form"
        onSubmit={handleSubmit(handleNext)}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
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

          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 1, mt: 1 }}
          >
            Personal Info
          </Typography>
          <Grid container spacing={2}>
            {/* <Grid item xs={12} md={6}> */}
            <Grid item size={6}>
              <RHFTextField
                loading={submitting}
                name="restaurantHeadName"
                label="Full Name*"
                backgroundColor={projectBackgroundColor}
              />
            </Grid>
            <Grid item size={6}>
              <RHFTextField
                backgroundColor={projectBackgroundColor}
                type="date"
                name="head_dob"
                loading={submitting}
                label="Date of Birth*"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: minDobStr,
                  max: maxDobStr,
                }}
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
                    !submitting &&
                    setValuesA((prev) => ({ ...prev, gender: genderOption }))
                  }
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    border: `2px solid ${
                      valuesA.gender === genderOption
                        ? layoutLightGreenColor
                        : "#e0e0e0"
                    }`,
                    backgroundColor: projectBackgroundColor,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: layoutLightGreenColor,
                      backgroundColor:
                        valuesA.gender === genderOption ? "#f0fdf4" : "#fafafa",
                    },
                  }}
                >
                  <label
                    style={{
                      cursor: "pointer",
                      fontWeight: valuesA.gender === genderOption ? 600 : 500,
                      color:
                        valuesA.gender === genderOption
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
                    disabled={submitting}
                    value={genderOption}
                    checked={valuesA.gender === genderOption}
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
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 1, mt: 3 }}
          >
            Contact Info
          </Typography>
          <Grid container spacing={2}>
            <Grid item size={6}>
              <RHFTextField
                loading={submitting}
                type="email"
                name="email"
                label="Email address*"
                backgroundColor={projectBackgroundColor}
                onInput={(e) => {
                  e.target.value = (e.target.value || "")
                    .replace(/[^a-zA-Z0-9]@./g, "")
                    .toLowerCase();
                }}
              />
            </Grid>
            <Grid item size={1.5}>
              <Select
                fullWidth
                size="small"
                value={valuesA.phoneCode}
                onChange={handleChange("phoneCode")}
                displayEmpty
                disabled={submitting}
                sx={{
                  "& .MuiSelect-select": { padding: "10px 12px" },
                  backgroundColor: projectBackgroundColor,
                }}
              >
                {countryCodes.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item size={4.5}>
              <RHFTextField
                loading={submitting}
                name="phoneNumber"
                backgroundColor={projectBackgroundColor}
                label="Phone Number*"
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 10,
                  onInput: (e) => {
                    e.target.value = (e.target.value || "")
                      .replace(/\D/g, "")
                      .slice(0, 10);
                  },
                }}
              />
            </Grid>
            <Grid item size={12}>
              <RHFTextField
                backgroundColor={projectBackgroundColor}
                loading={submitting}
                name="head_address"
                label="Address*"
              />
            </Grid>
          </Grid>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 1, mt: 3 }}
          >
            Emergency Contact
          </Typography>
          <Grid container spacing={2}>
            <Grid item size={6}>
              <RHFTextField
                backgroundColor={projectBackgroundColor}
                loading={submitting}
                name="emergencyName"
                label="Name*"
              />
            </Grid>
            <Grid item size={1.5}>
              <Select
                fullWidth
                size="small"
                disabled={submitting}
                value={valuesA.emergencyPhoneCode}
                onChange={handleChange("emergencyPhoneCode")}
                displayEmpty
                sx={{
                  "& .MuiSelect-select": { padding: "10px 12px" },
                  backgroundColor: projectBackgroundColor,
                }}
              >
                {countryCodes.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item size={4.5}>
              <RHFTextField
                backgroundColor={projectBackgroundColor}
                loading={submitting}
                name="emergencyPhoneNumber"
                label="Phone Number*"
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 10,
                  onInput: (e) => {
                    e.target.value = (e.target.value || "")
                      .replace(/\D/g, "")
                      .slice(0, 10);
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>
        {/* Actions */}
        <Box sx={{ width: "100%" }}>
          <Divider sx={{ m: 1 }} />
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
                sx={baseButtonSx}
                onClick={() => handleSave()}
                disabled={submitting}
                aria-label={isDraft ? "Update Draft" : "Save as draft"}
              >
                {isDraft ? "Update Draft" : "Save as Draft"}
              </Button>
              {isDraft && (
                <Button
                  sx={baseButtonSx}
                  onClick={() => handleGetDraft()}
                  disabled={submitting}
                >
                  Get Draft
                </Button>
              )}
              <Button
                variant="text"
                sx={{
                  ...baseButtonSx,
                }}
                disabled={submitting}
                onClick={() => handleDiscard()}
              >
                Discard
              </Button>
            </Box>

            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                ...baseButtonSx,
                bgcolor: layoutLightGreenColor,
                color: "white",
                "&:hover": { bgcolor: layoutDarkGreenColor },
              }}
            >
              {submitting ? "Submitting" : "Next"}
            </Button>
          </Box>
        </Box>
      </Box>
    </FormProvider>
  );
};

/**
 * STEP 2 FORM – Location details
 * localStorage key: reg_rest_two
 */
const StepTwoForm = ({ onNext, onPrev }) => {
  const [submitting, setSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const schemaB = Yup.object().shape({
    res_name: Yup.string()
      .transform((v) => (v ?? "").trim())
      .min(2, "Restaurant name must be at least 2 characters")
      .required("Restaurant Name is required"),
    restaurant_postal_code: Yup.string()
      .transform((v) => (v ?? "").trim())
      .required("Postal Code is required")
      .matches(/^[0-9]{6}$/, "Enter a valid 6-digit Postal Code"),
    restaurant_city: Yup.string()
      .transform((v) => (v ?? "").trim())
      .min(2, "City name must be at least 2 characters")
      .required("City is required"),
    restaurant_state: Yup.string()
      .transform((v) => (v ?? "").trim())
      .min(2, "State name must be at least 2 characters")
      .required("State is required"),
    restaurant_country: Yup.string()
      .transform((v) => (v ?? "").trim())
      .min(2, "State name must be at least 2 characters")
      .required("Country is required"),
    restaurant_branch_Code: Yup.string(),
    subscription_tier: Yup.mixed()
      .oneOf(["basic", "standard", "premium"], "Invalid subscription tier")
      .required("Subscription tier is required"),
    restaurant_email: Yup.string()
      .transform((v) => (v ?? "").trim())
      .email("Enter a valid email")
      .required("Email is required"),
    restaurant_tables: Yup.string()
      .transform((v) => (v ?? "").trim())
      .required("Total No.of Tables count is required"),
  });

  const initialB = {
    res_name: "",
    restaurant_branch_Code: "",
    restaurant_city: "",
    restaurant_state: "",
    restaurant_country: "",
    restaurant_postal_code: "",
    subscription_tier: "basic",
    restaurant_email: "",
    restaurant_tables: 0,
  };

  const methodsB = useForm({
    resolver: yupResolver(schemaB),
    defaultValues: initialB,
  });

  const { handleSubmit, reset } = methodsB;
  const dispatch = useDispatch();

  useEffect(() => {
    const draft = functionIsDraft();
    setIsDraft(Boolean(draft && Object.keys(draft).length > 0));
  }, []);

  useEffect(() => {
    const ls = loadLS("reg_rest_two", initialB);
    reset(ls);
  }, [reset]);

  const functionIsDraft = () => {
    const draftAvail = getLS("reg_rest_two");
    return draftAvail || null;
  };

  const handleSave = () => {
    const formValuesB = methodsB.getValues();
    saveLS("reg_rest_two", { ...formValuesB });
    setIsDraft(true);
    if (onNext) onNext(false);
  };

  const handleGetDraft = () => {
    const draft = getLS("reg_rest_two");
    if (draft && Object.keys(draft).length > 0) {
      reset(draft);
      setIsDraft(true);
    } else {
      setIsDraft(false);
    }
  };

  const handleNext = () => {
    setSubmitting(true);

    try {
      const formValuesB = methodsB.getValues();
      saveLS("reg_rest_two", { ...formValuesB });
      setIsDraft(true);

      dispatch(
        addNotification({
          notify_title: "Restaurant Registraion",
          notify_content: "Register 2nd step saved successfully.",
        })
      );
      if (onNext) onNext(true);
    } catch (err) {
      console.error("Error creating account:", err);
      alert(
        // err.response.data?.message ??
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscard = () => {
    reset(initialB);
    clearLS("reg_rest_two");
    setIsDraft(false);
  };

  return (
    <FormProvider {...methodsB}>
      <Box
        component="form"
        onSubmit={handleSubmit(handleNext)}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
          gap: 2,
        }}
      >
        <Box>
          <FormHeadComponent
            step="2"
            formHeadCompTitle="Location details"
            formHeadCompContent="Provide essential information about where the restaurant is located."
          />

          <Grid container spacing={2}>
            <Grid item size={6}>
              <RHFTextField
                loading={submitting}
                name="res_name"
                label="Restaurant Name*"
                backgroundColor={projectBackgroundColor}
              />
            </Grid>
            <Grid item size={6}>
              <RHFTextField
                loading={submitting}
                backgroundColor={projectBackgroundColor}
                type="email"
                name="restaurant_email"
                label="Restaurant Email address*"
              />
            </Grid>
            <Grid item size={6}>
              <RHFTextField
                loading={submitting}
                name="restaurant_branch_Code"
                label="Branch Code / Identifier"
                backgroundColor={projectBackgroundColor}
              />
            </Grid>
            <Grid item size={6}>
              <RHFTextField
                loading={submitting}
                name="restaurant_city"
                label="City*"
                backgroundColor={projectBackgroundColor}
              />
            </Grid>
            <Grid item size={6}>
              <RHFTextField
                loading={submitting}
                name="restaurant_state"
                label="State*"
                backgroundColor={projectBackgroundColor}
              />
            </Grid>
            <Grid item size={6}>
              <RHFTextField
                loading={submitting}
                name="restaurant_country"
                label="Country*"
                backgroundColor={projectBackgroundColor}
              />
            </Grid>
            <Grid item size={6}>
              <RHFTextField
                loading={submitting}
                name="restaurant_postal_code"
                backgroundColor={projectBackgroundColor}
                label="Postal code*"
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 6,
                  onInput: (e) => {
                    e.target.value = (e.target.value || "")
                      .replace(/\D/g, "")
                      .slice(0, 6);
                  },
                }}
              />
            </Grid>
            <Grid item size={6}>
              <RHFTextField
                name="subscription_tier"
                label="Subscription Tier"
                backgroundColor={projectBackgroundColor}
                select
                required
                loading={submitting}
              >
                <MenuItem value="basic">basic</MenuItem>
                <MenuItem value="standard">standard</MenuItem>
                <MenuItem value="premium">premium</MenuItem>
              </RHFTextField>
            </Grid>
            <Grid item size={3}>
              <RHFTextField
                name="restaurant_tables"
                label="No. of Tables Count"
                required
                type="text" // text for maxLength; validate as number in Yup
                inputProps={{
                  maxLength: 2,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                onKeyDown={(e) => {
                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "Tab",
                    "ArrowLeft",
                    "ArrowRight",
                  ];
                  if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                loading={submitting}
                backgroundColor={projectBackgroundColor}
              />
            </Grid>
          </Grid>
        </Box>
        {/* Actions */}
        <Box sx={{ width: "100%" }}>
          <Divider sx={{ m: 1 }} />
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
                sx={baseButtonSx}
                onClick={() => handleSave()}
                disabled={submitting}
                aria-label={isDraft ? "Update Draft" : "Save as draft"}
              >
                {isDraft ? "Update Draft" : "Save as Draft"}
              </Button>
              {isDraft && (
                <Button
                  sx={baseButtonSx}
                  onClick={() => handleGetDraft()}
                  disabled={submitting}
                >
                  Get Draft
                </Button>
              )}
              <Button
                variant="text"
                sx={{
                  ...baseButtonSx,
                }}
                disabled={submitting}
                onClick={() => handleDiscard()}
              >
                Discard
              </Button>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="outlined"
                sx={baseButtonSx}
                onClick={() => onPrev()}
              >
                Previous
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  ...baseButtonSx,
                  bgcolor: layoutLightGreenColor,
                  color: "white",
                  "&:hover": { bgcolor: layoutDarkGreenColor },
                }}
              >
                {submitting ? "Submitting" : "Next"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </FormProvider>
  );
};

/**
 * STEP 3 FORM – Documents / final
 * localStorage key: reg_rest_three
 */
const StepThreeForm = ({ onPrev }) => {
  const [submitting, setSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const navigate = useNavigate();

  const schemaC = Yup.object().shape({
    restaurant_GSTIN_num: Yup.string().required("GSTIN is required"),
    restaurant_tax: Yup.string()
      .transform((v) => (v ?? "").trim())
      .required("TAX Percentage (%) is required")
      .matches(/^[0-9]{2}$/, "Enter a valid 2-digit Tax Percentage (%)"),
    restaurant_license_num: Yup.string(),
    restaurant_pancard_num: Yup.string(),
    notes: Yup.string(),
  });

  const initialC = {
    restaurant_license_num: "",
    restaurant_pancard_num: "",
    restaurant_GSTIN_num: "",
    restaurant_tax: "",
    notes: "",
  };

  const methodsC = useForm({
    resolver: yupResolver(schemaC),
    defaultValues: initialC,
  });

  const { handleSubmit, reset } = methodsC;
  const dispatch = useDispatch();

  useEffect(() => {
    const draft = functionIsDraft();
    setIsDraft(Boolean(draft && Object.keys(draft).length > 0));
  }, []);

  useEffect(() => {
    const ls = loadLS("reg_rest_three", initialC);
    reset(ls);
  }, [reset]);

  const functionIsDraft = () => {
    const draftAvail = getLS("reg_rest_three");
    return draftAvail || null;
  };

  const handleSave = () => {
    const formValuesC = methodsC.getValues();
    saveLS("reg_rest_three", { ...formValuesC });
    setIsDraft(true);
  };

  const handleGetDraft = () => {
    const draft = getLS("reg_rest_three");
    if (draft && Object.keys(draft).length > 0) {
      reset(draft);
      setIsDraft(true);
    } else {
      setIsDraft(false);
    }
  };

  const handleOnSubmit = () => {
    handleSave();
    setConfirmModalOpen(true);
  };

  const handleConfirmNo = () => {
    setConfirmModalOpen(false);
  };

  const handleConfirmYes = () => {
    setConfirmModalOpen(false);
    handleOnSubmitByYes();
  };

  const handleOnSubmitByYes = async () => {
    setSubmitting(true);
    const stepOne = getLS("reg_rest_one") || {};
    const stepTwo = getLS("reg_rest_two") || {};
    const stepThree = getLS("reg_rest_three") || {};

    const rest_reg_data = [stepOne, stepTwo, stepThree];
    console.log(rest_reg_data);
    // saveLS("rest_reg_data", rest_reg_data);

    const payload = {
      id: `local_${Date.now()}`, // unique id for local entries
      created_at: new Date().toISOString(),
      restaurantData: {
        res_name: rest_reg_data?.[1]?.res_name || "",
        email: rest_reg_data?.[1]?.restaurant_email || "",
      },
      commonData: {
        line1: rest_reg_data?.[1]?.restaurant_branch_Code || "",
        line2: rest_reg_data?.[1]?.restaurant_country || "",
        street: rest_reg_data?.[1]?.restaurant_branch_Code || "",
        state: rest_reg_data?.[1]?.restaurant_state || "",
        city: rest_reg_data?.[1]?.restaurant_city || "",
        zip_code: Number(rest_reg_data?.[1]?.restaurant_postal_code) || null,
        phone: rest_reg_data?.[0]?.phoneNumber || "",
      },
      locationData: {
        tax_id: rest_reg_data?.[2]?.restaurant_GSTIN_num || "",
        tax: Number(rest_reg_data?.[2]?.restaurant_tax) || 0,
        subscription_tier: rest_reg_data?.[1]?.subscription_tier || "",
        no_of_tables: Number(rest_reg_data?.[1]?.restaurant_tables) || 0,
      },
    };
    try {
      console.log(payload);
      // Merge with existing saved list instead of replacing
      const existing = getLS("rest_reg_data");
      let newList = [];

      if (Array.isArray(existing)) {
        newList = [...existing, payload];
      } else if (existing && typeof existing === "object") {
        // older single-object format -> keep it and append new one
        newList = [existing, payload];
      } else {
        newList = [payload];
      }
      saveLS("rest_reg_data", newList);

      //   const response = await createRestaurants(payload);
      //   console.log(response);

      // clear all drafts
      clearLS("reg_rest_one");
      clearLS("reg_rest_two");
      handleDiscard();

      dispatch(
        addNotification({
          notify_title: "Restaurant Registraion",
          notify_content: "Registration Submitted successfully.",
        })
      );
      navigate("/restaurants_list");
      //   setsnackbarContent("Restaurant created Successfully");
      //   setSnackbarMode("success");
      //   setSuccessSnackbarOpen(true);
      //   reset(defaultValues);
    } catch (e) {
      console.error("Failed to save registration locally", e);

      //   setsnackbarContent("Failed to create restaurant. Please try again");
      //   setSnackbarMode("error");
      //   setSuccessSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }

    // NOTE: call your API here with `rest_reg_data` when ready
  };

  const handleDiscard = () => {
    reset(initialC);
    clearLS("reg_rest_three");
    setIsDraft(false);
  };

  return (
    <FormProvider {...methodsC}>
      <Box
        component="form"
        onSubmit={handleSubmit(handleOnSubmit)}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
          gap: 2,
        }}
      >
        <Box>
          <FormHeadComponent
            step="3"
            formHeadCompTitle="Documents"
            formHeadCompContent="Provide the mandatory document details of this restaurant."
          />

          <Grid container spacing={2}>
            <Grid item size={6}>
              <RHFTextField
                loading={submitting}
                name="restaurant_GSTIN_num"
                label="Restaurant GSTIN Number*"
                backgroundColor={projectBackgroundColor}
                onKeyDown={(e) => {
                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                  ];
                  if (allowedKeys.includes(e.key)) return;
                  if (!/^[a-zA-Z0-9]$/.test(e.key)) e.preventDefault();
                }}
                onInput={(e) => {
                  e.target.value = (e.target.value || "")
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .toUpperCase();
                }}
                inputProps={{
                  maxLength: 15,
                }}
              />
            </Grid>
            <Grid item size={6}>
              <RHFTextField
                loading={submitting}
                name="restaurant_license_num"
                label="Restaurant License Number"
                backgroundColor={projectBackgroundColor}
                onKeyDown={(e) => {
                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                  ];
                  if (allowedKeys.includes(e.key)) return;
                  if (!/^[a-zA-Z0-9]$/.test(e.key)) e.preventDefault();
                }}
                onInput={(e) => {
                  e.target.value = (e.target.value || "")
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .toUpperCase();
                }}
                inputProps={{
                  maxLength: 15,
                }}
              />
            </Grid>
            <Grid item size={6}>
              <RHFTextField
                loading={submitting}
                name="restaurant_pancard_num"
                label="Restaurant PAN Card Number"
                backgroundColor={projectBackgroundColor}
                onKeyDown={(e) => {
                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                  ];
                  if (allowedKeys.includes(e.key)) return;
                  if (!/^[a-zA-Z0-9]$/.test(e.key)) e.preventDefault();
                }}
                onInput={(e) => {
                  e.target.value = (e.target.value || "")
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .toUpperCase();
                }}
                inputProps={{
                  maxLength: 10,
                }}
              />
            </Grid>
            <Grid item size={6}>
              <RHFTextField
                loading={submitting}
                name="restaurant_tax"
                backgroundColor={projectBackgroundColor}
                label="Restaurant TAX*"
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 2,
                  onInput: (e) => {
                    e.target.value = (e.target.value || "")
                      .replace(/\D/g, "")
                      .slice(0, 2);
                  },
                }}
              />
            </Grid>
            <Grid item size={12}>
              <RHFTextField
                loading={submitting}
                name="notes"
                multiline
                minRows={2}
                label="Notes"
                backgroundColor={projectBackgroundColor}
              />
            </Grid>
          </Grid>
        </Box>
        {/* Actions */}
        <Box sx={{ width: "100%" }}>
          <Divider sx={{ m: 1 }} />
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
                sx={baseButtonSx}
                onClick={() => handleSave()}
                disabled={submitting}
                aria-label={isDraft ? "Update Draft" : "Save as draft"}
              >
                {isDraft ? "Update Draft" : "Save as Draft"}
              </Button>
              {isDraft && (
                <Button
                  sx={baseButtonSx}
                  onClick={() => handleGetDraft()}
                  disabled={submitting}
                >
                  Get Draft
                </Button>
              )}
              <Button
                variant="text"
                sx={{
                  ...baseButtonSx,
                }}
                disabled={submitting}
                onClick={() => handleDiscard()}
              >
                Discard
              </Button>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="outlined"
                sx={baseButtonSx}
                onClick={() => onPrev()}
              >
                Previous
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  ...baseButtonSx,
                  bgcolor: layoutLightGreenColor,
                  color: "white",
                  "&:hover": { bgcolor: layoutDarkGreenColor },
                }}
              >
                {submitting ? "Submitting" : "Submit"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      <ConfirmationComponent
        open={confirmModalOpen}
        title="Confirm Submission"
        message="Are you sure you want to submit the restaurant registration?"
        onConfirm={handleConfirmYes}
        handleClose={handleConfirmNo}
        loading={submitting}
        color={layoutLightGreenColor}
      />
    </FormProvider>
  );
};

const RestaurantRegistrationRightComp = ({ step, onStepChange }) => {
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

export default RestaurantRegistrationRightComp;
