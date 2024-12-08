import { useEffect, useState } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Divider from "@mui/material/Divider";

import { Typography, Stack, useTheme } from "@mui/material";

import { tokens } from "../theme";

const ToggleButtonCheck = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { error, ...rest } = props;

  return (
    <ToggleButtonGroup
      {...rest}
      sx={{
        height: "30px",
        "& .Mui-selected": {
          background: "#f93339 !important",
        },
        "& .Mui-selected:hover": {
          background: "#f93339 !important",
        },
        justifySelf: "center",
      }}
      value={props.alignment}
      onChange={(_, newValue) => {
        if (newValue != null) {
          props.onChange(newValue);
        }
      }}
      exclusive
      aria-label="switch"
    >
      {props.options?.map((option, i) => {
        return (
          <ToggleButton
            key={option.label}
            value={option.label}
            aria-label={i}
            sx={{
              borderColor: props.error ? "red" : colors.contrast[100],
            }}
          >
            <Stack direction="row" spacing={1}>
              <Divider
                orientation="vertical"
                variant="middle"
                flexItem
                sx={{
                  background: "black",
                  width: "2px",
                  margin: "4px !important",
                  backgroundColor:
                    props.alignment === option.label
                      ? colors.contrast[300]
                      : colors.contrast[100],
                }}
              />
              <Stack direction="row" spacing={0.3}>
                {option.icon}
                <Typography
                  sx={{
                    textTransform: "none",
                    color: "black",
                    fontWeight: "600",
                    color:
                      props.alignment === option.label
                        ? colors.contrast[300]
                        : colors.contrast[100],
                  }}
                >
                  {option.label}
                </Typography>
              </Stack>
              <Divider
                orientation="vertical"
                flexItem
                variant="middle"
                sx={{
                  background: "black",
                  width: "2px",
                  margin: "4px !important",
                  marginLeft: "10px !important",
                  backgroundColor:
                    props.alignment === option.label
                      ? colors.contrast[300]
                      : colors.contrast[100],
                }}
              />
            </Stack>
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
};

export default ToggleButtonCheck;
