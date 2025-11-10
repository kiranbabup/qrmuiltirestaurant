import { useFormContext, Controller } from "react-hook-form";
import { CircularProgress, IconButton, TextField } from "@mui/material";
import { styled } from "@mui/styles";
import React, { useEffect, useState } from "react";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const CustomTextField = styled(TextField)({
  borderRadius: 1,
  marginTop: "0px !important",
});

export default function RHFTextField(props) {
  const {
    name,
    label,
    loading,
    onChange,
    InputLabelProps,
    inputProps,
    type,
    ...other
  } = props;

  const { control } = useFormContext();
  const [passwordType, setPasswordType] = useState(type);
  const [eyeIcon, setEyeIcon] = useState(false);

  useEffect(() => {
    setPasswordType(type);
  }, [type]);

  const togglePasswordVisibility = () => {
    setEyeIcon((v) => !v);
    setPasswordType((prev) => (prev === "password" ? "text" : "password"));
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <CustomTextField
          {...field}
          fullWidth
          size="small"
          value={
            typeof field.value === "number" && field.value === 0
              ? ""
              : field.value ?? ""
          }
          onChange={(e) => {
            field.onChange(e.target.value); // keep RHF in control
            onChange && onChange(e);        // optional side effects
          }}
          error={!!error}
          helperText={error?.message}
          label={label}
          InputLabelProps={{ ...InputLabelProps }}
          InputProps={{
            endAdornment: (
              <>
                {loading ? <CircularProgress color="primary" size={20} /> : null}
                {type === "password" && (
                  <IconButton onClick={togglePasswordVisibility} sx={{ p: 0 }}>
                    {eyeIcon ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                )}
              </>
            ),
          }}
          inputProps={inputProps}  // <-- lets you use maxLength, pattern, inputMode
          type={passwordType}
          {...other}
        />
      )}
    />
  );
}
