import * as React from "react";
import PropTypes from "prop-types";
import { IMaskInput } from "react-imask";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

const TextMaskCustom = React.forwardRef(function TextMaskCustom(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="#00 000-0000"
      definitions={{
        "#": /[1-9]/,
      }}
      inputRef={ref}
      onAccept={(value) => {
        onChange({ target: { name: props.name, value } });
      }}
      overwrite
    />
  );
});

TextMaskCustom.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function PhoneInput(props) {
  return (
    <TextField
      {...props}
      InputProps={{
        inputComponent: TextMaskCustom,
        startAdornment: <InputAdornment position="start">+1</InputAdornment>,
      }}
    />
  );
}
