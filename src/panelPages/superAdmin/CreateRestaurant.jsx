import { Box, Paper, Button, Typography, MenuItem } from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LsService, { storageKey } from "../../services/localstorage";
import { createRestaurants, fetchSubscriptions } from "../../services/api";
import RHFTextField from "../../components/RHFTextField";
import { useForm, FormProvider } from "react-hook-form";
import SnackbarCompo from "../../components/SnackbarCompo";
import SmallScreenError from "../../components/panelComponents/SmallScreenError";
import {
  lrgScreenStyle,
} from "../../components/panelComponents/panelStyles";
import { styled } from "@mui/styles";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

export const CustomGridBox = styled(Box)({
  display: "flex",
  gap: "10px",
  alignItems: "center",
  margin: "10px 0px",
});

const defaultValues = {
  // restaurantData
  res_name: "",
  email: "",

  // commonData
  line1: "",
  line2: "",
  street: "",
  state: "",
  city: "",
  zip_code: "",
  phone: "",

  // locationData
  tax_id: "",
  tax: "",
  subscription_tier: "basic", // premium
  no_of_tables: "",
  subscription_expires_at: "",
};

// ---------- Validation (Yup) ----------
const schema = Yup.object().shape({
  // Restaurant
  res_name: Yup.string()
    .transform((v) => (v ?? "").trim())
    .min(2, "Restaurant name must be at least 2 characters")
    .required("Restaurant Name is required"),

  email: Yup.string()
    .transform((v) => (v ?? "").trim())
    .email("Enter a valid email")
    .required("Email is required"),

  // Common address
  line1: Yup.string()
    .transform((v) => (v ?? "").trim())
    .min(4, "Address Line 1 must be at least 4 characters")
    .required("Address Line 1 is required"),

  // allow empty, but if provided, min 4
  line2: Yup.string()
    .transform((v) => (v ?? "").trim())
    .min(4, "Address Line 2 must be at least 4 characters")
    .required("Address Line 2 is required"),

  street: Yup.string()
    .transform((v) => (v ?? "").trim())
    .min(4, "Street must be at least 4 characters")
    .required("Street is required"),

  state: Yup.string()
    .transform((v) => (v ?? "").trim())
    .min(4, "State must be at least 4 characters")
    .required("State is required"),

  city: Yup.string()
    .transform((v) => (v ?? "").trim())
    .required("City is required"),

  zip_code: Yup.string()
    .transform((v) => (v ?? "").trim())
    .matches(/^\d{6,}$/, "ZIP / PIN must be at least 6 digits")
    .required("ZIP / PIN Code is required"),

  phone: Yup.string()
    .transform((v) => (v ?? "").trim())
    .test(
      "at-least-10-digits",
      "Phone must contain at least 10 digits",
      (value) => {
        const digits = (value || "").replace(/\D/g, "");
        return digits.length >= 10;
      }
    )
    .required("Phone is required"),

  // Location
  tax_id: Yup.string()
    .transform((v) => (v ?? "").trim())
    .min(15, "Tax ID must be at least 15 characters")
    .required("Tax ID / GSTIN is required"),

  tax: Yup.string()
    .transform((v) => (v ?? "").trim())
    .min(1, "Tax must be at least 1 characters")
    // .matches(
    //   /^\d+(\.\d{1,2})?$/,
    //   "Tax must be a number (optionally with up to 2 decimals)"
    // )
    .required("Tax % is required"),

  subscription_tier: Yup.mixed()
    .oneOf(["basic", "standard", "premium"], "Invalid subscription tier")
    .required("Subscription tier is required"),

  no_of_tables: Yup.number()
    .typeError("No. of Tables must be a number")
    .integer("No. of Tables must be an integer")
    .min(1, "No. of Tables cannot be negative")
    .required("No. of Tables is required"),
});

// ---------- Helpers ----------
const trim = (v) => (v ?? "").trim();
const digitsOnly = (v) => (v ?? "").replace(/\D/g, "");

const CreateRestaurant = () => {
  // export default function CreateRestaurant() {
  const navigate = useNavigate();
  const user = LsService.getItem(storageKey);

  const [submitting, setSubmitting] = useState(false);
  const [snackbarContent, setsnackbarContent] = useState("");
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [snackbarMode, setSnackbarMode] = useState("");
  const [subscriptionsList, setSubscriptionsList] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "super_admin") {
      LsService.removeItem(storageKey);
      navigate("/");
    }
    fetchSubscriptionsList();
  }, [user, navigate]);

  const fetchSubscriptionsList = async () => {
    try {
      const subscriptions = await fetchSubscriptions();
      console.log(subscriptions);

      // setsnackbarContent("Restaurant created Successfully");
      // setSnackbarMode("success");
      // setSuccessSnackbarOpen(true);
    } catch (e) {
      // setsnackbarContent("Failed to create restaurant. Please try again");
      // setSnackbarMode("error");
      // setSuccessSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };
  
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: "onSubmit",
  });

  const handleSnackbarClose = (_e, reason) => {
    if (reason === "clickaway") return;
    setSuccessSnackbarOpen(false);
  };

  const { handleSubmit, reset } = methods;

  const onSubmit = async (values) => {
    setSubmitting(true);

    const payload = {
      restaurantData: {
        res_name: trim(values.res_name),
        email: trim(values.email),
      },
      commonData: {
        line1: trim(values.line1),
        line2: trim(values.line2),
        street: trim(values.street),
        state: trim(values.state),
        city: trim(values.city),
        zip_code: digitsOnly(values.zip_code), // normalize
        phone: digitsOnly(values.phone), // normalize
      },
      locationData: {
        tax_id: trim(values.tax_id),
        tax: String(values.tax ?? "").trim(),
        subscription_tier: values.subscription_tier,
        no_of_tables: Number(values.no_of_tables || 0),
      },
    };

    try {
      console.log(payload);

      await createRestaurants(payload);
      setsnackbarContent("Restaurant created Successfully");
      setSnackbarMode("success");
      setSuccessSnackbarOpen(true);
      reset(defaultValues);
    } catch (e) {
      setsnackbarContent("Failed to create restaurant. Please try again");
      setSnackbarMode("error");
      setSuccessSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Large screen view */}
      <Box sx={lrgScreenStyle}>
        {/* left panel */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "start",
            width: "18vw",
            maxHeight: "100vh",
            mx: "8px",
          }}
        >
          <LeftPannel HeaderTitle="Super Admin" />
        </Box>

        {/* right panel*/}
        <Box
          sx={{
            width: "calc( 100vw - 20vw )",
            display: "flex",
            flexDirection: "column",
            height: "97vh",
          }}
        >
          <HeaderPannel HeaderTitle="Create Restaurant" />
          <Box
            sx={{
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: 0, height: 0 },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              borderRadius: "10px",
              boxShadow:
                "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
            }}
          >
            <Paper elevation={2} sx={{ p: 2, backgroundColor: "#fafafa" }}>
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  {/* Restaurant Data */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Restaurant Details
                  </Typography>
                  <CustomGridBox>
                    <RHFTextField
                      name="res_name"
                      label="Restaurant Name"
                      required
                      loading={submitting}
                      inputProps={{ maxLength: 60 }}
                    />
                    <RHFTextField
                      name="email"
                      label="Email"
                      type="email"
                      required
                      loading={submitting}
                      inputProps={{ maxLength: 60 }}
                    />
                  </CustomGridBox>

                  {/* Common Data */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Address (Common)
                  </Typography>
                  <CustomGridBox>
                    <RHFTextField
                      name="line1"
                      label="Address Line 1"
                      required
                      loading={submitting}
                      inputProps={{ maxLength: 100 }}
                    />
                    <RHFTextField
                      name="line2"
                      label="Address Line 2"
                      loading={submitting}
                      inputProps={{ maxLength: 100 }}
                    />
                  </CustomGridBox>
                  <CustomGridBox>
                    <RHFTextField
                      name="street"
                      label="Street"
                      required
                      loading={submitting}
                      inputProps={{ maxLength: 60 }}
                    />
                    <RHFTextField
                      name="city"
                      label="City"
                      required
                      loading={submitting}
                      inputProps={{ maxLength: 60 }}
                    />
                  </CustomGridBox>
                  <CustomGridBox>
                    <RHFTextField
                      name="state"
                      label="State"
                      required
                      loading={submitting}
                      inputProps={{ maxLength: 60 }}
                    />
                    <RHFTextField
                      name="zip_code"
                      label="ZIP / PIN Code"
                      required
                      loading={submitting}
                      // Keep as text to use maxLength; validate via Yup
                      type="text"
                      inputProps={{
                        maxLength: 6,
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
                        if (
                          !allowedKeys.includes(e.key) &&
                          !/^[0-9]$/.test(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <RHFTextField
                      name="phone"
                      label="Phone"
                      required
                      loading={submitting}
                      type="tel"
                      inputProps={{
                        maxLength: 10,
                        inputMode: "tel",
                        pattern: "[0-9+ -]*",
                      }}
                      onKeyDown={(e) => {
                        const allowedKeys = [
                          "Backspace",
                          "Delete",
                          "Tab",
                          "ArrowLeft",
                          "ArrowRight",
                        ];
                        if (
                          !allowedKeys.includes(e.key) &&
                          !/^[0-9]$/.test(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </CustomGridBox>

                  {/* Location Data */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Location Settings
                  </Typography>

                  <CustomGridBox>
                    <RHFTextField
                      name="tax_id"
                      label="Tax ID / GSTIN"
                      required
                      loading={submitting}
                      type="text"
                      inputProps={{ maxLength: 25 }}
                    />
                    <RHFTextField
                      name="tax"
                      label="Tax %"
                      required
                      type="text"
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
                        if (
                          !allowedKeys.includes(e.key) &&
                          !/^[0-9]$/.test(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      loading={submitting}
                    />
                  </CustomGridBox>

                  <CustomGridBox>
                    <RHFTextField
                      name="no_of_tables"
                      label="No. of Tables"
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
                        if (
                          !allowedKeys.includes(e.key) &&
                          !/^[0-9]$/.test(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      loading={submitting}
                    />

                    {/* subscription tier as select */}
                    <RHFTextField
                      name="subscription_tier"
                      label="Subscription Tier"
                      select
                      required
                      loading={submitting}
                    >
                      <MenuItem value="basic">basic</MenuItem>
                      <MenuItem value="standard">standard</MenuItem>
                      <MenuItem value="premium">premium</MenuItem>
                    </RHFTextField>
                  </CustomGridBox>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-around",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="error"
                      sx={{ textTransform: "none" }}
                      onClick={() => reset(defaultValues)}
                      size="small"
                    >
                      Clear
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="success"
                      size="small"
                      disabled={submitting}
                      sx={{ textTransform: "none" }}
                    >
                      {submitting ? "Creating..." : "Create Restaurant"}
                    </Button>
                  </Box>
                </form>
              </FormProvider>
            </Paper>
          </Box>
        </Box>

        <SnackbarCompo
          handleSnackbarClose={handleSnackbarClose}
          successSnackbarOpen={successSnackbarOpen}
          snackbarContent={snackbarContent}
          snackbarMode={snackbarMode}
        />
      </Box>

      {/* Mobile View warning*/}
      <SmallScreenError />
    </Box>
  );
};

export default CreateRestaurant;
