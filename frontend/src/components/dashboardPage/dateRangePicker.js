import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { Stack, Paper, Button, useTheme } from "@mui/material";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { useEffect, useState } from "react";

import { tokens } from "../../theme";

export const useRangePicker = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getter = { startDate, endDate };
  const setter = { setStartDate, setEndDate };
  return [getter, setter];
};

function LabelField(props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const {
    open,
    setOpen,
    placeholder,
    hoverText,
    label,
    id,
    disabled,
    InputProps: { ref } = {},
    inputProps: { "aria-label": ariaLabel } = {},
  } = props;
  return (
    <Button
      variant="text"
      sx={{
        borderRadius: 0,
        color: hoverText !== "" ? colors.grey[400] : colors.grey[100],
        paddingRight: 3,
        width: "100%",
        height: "100%",
        transition: "0.1s",
        borderBottom: open ? "2px solid black" : undefined,
      }}
      id={id}
      disabled={disabled}
      ref={ref}
      aria-label={ariaLabel}
      onClick={() => setOpen?.((prev) => !prev)}
    >
      {open
        ? hoverText === ""
          ? label?.format("YYYY-MM-DD") ?? placeholder
          : hoverText
        : label?.format("YYYY-MM-DD") ?? placeholder}
    </Button>
  );
}
function DayRenderer(props) {
  const { setHoverText, day, outsideCurrentMonth, ...other } = props;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <PickersDay
      sx={{
        borderRadius: 0,
        mx: 0,
        px: 2.5,
        "&:hover": {
          backgroundColor: colors.ciboInnerGreen[500],
        },
        "&.MuiPickersDay-today": {
          borderColor: colors.ciboInnerGreen[600],
        },
        "&.MuiPickersDay-root.Mui-selected": {
          background: colors.ciboInnerGreen[700],
        },
      }}
      centerRipple={true}
      onMouseOver={() => {
        setHoverText(day.format("YYYY-MM-DD"));
      }}
      onMouseLeave={() => {
        setHoverText("");
      }}
      {...other}
      outsideCurrentMonth={outsideCurrentMonth}
      day={day}
    />
  );
}

function LabelDatePicker(props) {
  const { open, setOpen } = props;
  const [hoverText, setHoverText] = useState("");
  const placeholder = props.placeholder;
  return (
    <DatePicker
      slots={{ field: LabelField, ...props.slots, day: DayRenderer }}
      slotProps={{
        field: { open, setOpen, placeholder, hoverText },
        day: { setHoverText },
        desktopPaper: {
          sx: {
            marginTop: 1,
            "& .MuiDayCalendar-monthContainer .MuiDayCalendar-weekContainer": {
              my: 0,
            },
          },
        },
      }}
      onChange={() => {
        setHoverText("");
      }}
      {...props}
    />
  );
}

const DateRangePicker = (props) => {
  const theme = useTheme();

  const { startDate, endDate } = props.getter;
  const { setStartDate, setEndDate } = props.setter;

  const [_start, _setStart] = useState(null);
  const [_end, _setEnd] = useState(null);

  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  useEffect(() => {
    if (startDate === "") {
      _setStart(null);
    }
    if (endDate === "") {
      _setEnd(null);
    }
  }, [startDate, endDate]);

  return (
    <Paper
      {...props.sx}
      sx={{
        height: "52px",
        background: theme.palette.mode === "light" ? "#e4e2e2" : "#333d51",
      }}
    >
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Stack
          spacing={0}
          direction="row"
          mx={0}
          sx={{
            alignItems: "center",
            justifyContent: "space-evenly",
            height: "100%",
          }}
        >
          <LabelDatePicker
            open={openStart}
            setOpen={setOpenStart}
            onClose={() => {
              setOpenStart(false);
            }}
            placeholder="Start Date"
            value={_start}
            maxDate={_end ? _end.clone().subtract(1, "days") : null}
            label={_start}
            onChange={(value) => {
              setStartDate(value.format("YYYY-MM-DD"));
              _setStart(value);
            }}
          />
          <ArrowRightAltIcon />
          <LabelDatePicker
            open={openEnd}
            setOpen={setOpenEnd}
            onClose={() => {
              setOpenEnd(false);
            }}
            placeholder="End Date"
            value={_end}
            minDate={_start ? _start.clone().add(1, "days") : null}
            label={_end}
            onChange={(value) => {
              setEndDate(value.format("YYYY-MM-DD"));
              _setEnd(value);
            }}
          />
        </Stack>
      </LocalizationProvider>
    </Paper>
  );
};

export default DateRangePicker;
