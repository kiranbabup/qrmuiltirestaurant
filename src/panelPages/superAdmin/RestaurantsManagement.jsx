// src/pages/super-admin/RestaurantsManagement.jsx
import { Box, Paper, Grid, Button, Typography, MenuItem, Snackbar, Alert } from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LsService, { storageKey } from "../../services/localstorage";
import { createRestaurants } from "../../services/api";
import RHFTextField from "../../components/RHFTextField";
// react-hook-form
import { useForm, FormProvider } from "react-hook-form";

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
  subscription_tier: "basic",
  subscription_expires_at: "", // "YYYY-MM-DDTHH:mm"
  no_of_tables: "",
};

const RestaurantsManagement = () => {
  const navigate = useNavigate();
  const user = LsService.getItem(storageKey);

  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

  useEffect(() => {
    if (!user || user.role !== "super_admin") {
      LsService.removeItem(storageKey);
      navigate("/");
    }
  }, [user, navigate]);

  const methods = useForm({
    defaultValues,
    mode: "onSubmit",
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (values) => {
    setSubmitting(true);

    // Convert subscription_expires_at (local input) → ISO8601 Z
    let expiresISO = "";
    if (values.subscription_expires_at) {
      // assume input type="datetime-local"
      const dt = new Date(values.subscription_expires_at);
      expiresISO = dt.toISOString(); // e.g. "2026-12-31T23:59:59.000Z"
    }

    const payload = {
      restaurantData: {
        res_name: values.res_name.trim(),
        email: values.email.trim(),
      },
      commonData: {
        line1: values.line1.trim(),
        line2: values.line2.trim(),
        street: values.street.trim(),
        state: values.state.trim(),
        city: values.city.trim(),
        zip_code: values.zip_code.trim(),
        phone: values.phone.trim(),
      },
      locationData: {
        tax_id: values.tax_id.trim(),
        tax: String(values.tax || "").trim(),
        subscription_tier: values.subscription_tier,
        subscription_expires_at: expiresISO || null,
        no_of_tables: Number(values.no_of_tables || 0),
      },
    };

    try {
      await createRestaurants(payload);
      setSnack({ open: true, type: "success", msg: "Restaurant created successfully." });
      reset(defaultValues);
    } catch (e) {
      setSnack({
        open: true,
        type: "error",
        msg: e?.response?.data?.message || "Failed to create restaurant. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: "99vw", height: "94vh", backgroundColor: "white", display: "flex" }}>
      {/* left panel */}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "start", width: "18vw", mt: 1.5 }}>
        <LeftPannel HeaderTitle="Super Admin" />
      </Box>

      {/* right */}
      <Box sx={{ minWidth: "calc( 99vw - 18vw )", ml: 1.5 }}>
        <HeaderPannel HeaderTitle="Restaurants Management" />

        {/* Body */}
        <Box sx={{ width: "99%", mb: 4, p: 2 }}>
          <Paper elevation={2} sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Create Restaurant
            </Typography>

            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Grid container spacing={2}>
                  {/* Restaurant Data */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Restaurant Details
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="res_name"
                      label="Restaurant Name"
                      required
                      onChange={() => {}}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="email"
                      label="Email"
                      type="email"
                      required
                      onChange={() => {}}
                    />
                  </Grid>

                  {/* Common Data */}
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Address (Common)
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <RHFTextField name="line1" label="Address Line 1" required onChange={() => {}} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField name="line2" label="Address Line 2" onChange={() => {}} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <RHFTextField name="street" label="Street" required onChange={() => {}} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <RHFTextField name="city" label="City" required onChange={() => {}} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <RHFTextField name="state" label="State" required onChange={() => {}} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField name="zip_code" label="ZIP / PIN Code" required onChange={() => {}} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField name="phone" label="Phone" required onChange={() => {}} />
                  </Grid>

                  {/* Location Data */}
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Location Settings
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <RHFTextField name="tax_id" label="Tax ID / GSTIN" required onChange={() => {}} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <RHFTextField
                      name="tax"
                      label="Tax %"
                      type="number"
                      required
                      inputProps={{ min: 0, step: "0.01" }}
                      onChange={() => {}}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <RHFTextField
                      name="no_of_tables"
                      label="No. of Tables"
                      type="number"
                      required
                      inputProps={{ min: 0, step: 1 }}
                      onChange={() => {}}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    {/* subscription tier as select */}
                    <RHFTextField
                      name="subscription_tier"
                      label="Subscription Tier"
                      select
                      required
                      onChange={() => {}}
                    >
                      <MenuItem value="basic">basic</MenuItem>
                      <MenuItem value="standard">standard</MenuItem>
                      <MenuItem value="premium">premium</MenuItem>
                    </RHFTextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="subscription_expires_at"
                      label="Subscription Expires At (Local)"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      onChange={() => {}}
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Button type="submit" variant="contained" disabled={submitting}>
                      {submitting ? "Creating..." : "Create Restaurant"}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </FormProvider>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RestaurantsManagement;