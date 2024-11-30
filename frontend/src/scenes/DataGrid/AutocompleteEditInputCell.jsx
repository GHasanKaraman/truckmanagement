import * as React from "react";
import { Autocomplete, Chip, TextField, useTheme } from "@mui/material/";
import { useGridApiContext } from "@mui/x-data-grid";
import { tokens } from "../../theme";

export function AutocompleteEditInputCell(props) {
  const { id, value, field } = props;
  const apiRef = useGridApiContext();
  const ref = React.useRef();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleChange = (_, newValue) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue });
  };

  return props.type === "single" ? (
    <Autocomplete
      sx={{
        width: "100%",
        "& .MuiFilledInput-input": { marginBottom: "15px" },
      }}
      ref={ref}
      value={value}
      name="autocomplete"
      options={props.options}
      onChange={handleChange}
      renderInput={(parameter) => <TextField {...parameter} />}
    />
  ) : props.type === "custom" ? (
    <Autocomplete
      sx={{
        width: "100%",
        "& .MuiFilledInput-input": { marginBottom: "15px" },
      }}
      ref={ref}
      name="autocomplete"
      value={value}
      options={props.options}
      getOptionLabel={props.getOptionLabel}
      isOptionEqualToValue={props.isOptionEqualToValue}
      onChange={handleChange}
      renderInput={(parameter) => <TextField {...parameter} />}
    />
  ) : (
    <Autocomplete
      onFocus={(event) => {
        event.stopPropagation();
      }}
      disableCloseOnSelect={true}
      multiple
      onChange={handleChange}
      value={value}
      sx={{
        width: "100%",
        "& .MuiFilledInput-input": { marginBottom: "15px" },
      }}
      options={props.options}
      getOptionLabel={({ target }) => target}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      renderInput={(params) => <TextField {...params} />}
      renderTags={(tagValue, tagProps) => {
        return tagValue.map((option, index) => {
          return (
            <Chip
              size="small"
              variant="filled"
              color="primary"
              style={{
                backgroundColor: colors.ciboInnerGreen[600],
                color: colors.ciboInnerGreen[100],
                fontWeight: "bold",
              }}
              {...tagProps({ index })}
              label={option.target}
            />
          );
        });
      }}
    />
  );
}
