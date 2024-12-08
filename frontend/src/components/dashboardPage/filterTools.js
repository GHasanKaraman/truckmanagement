import React, { useState } from "react";

import {
  Box,
  Button,
  CardHeader,
  Grid,
  TextField,
  Stack,
  useTheme,
  Card,
  IconButton,
  CardActions,
  CardContent,
  Paper,
  InputBase,
  Divider,
  Collapse,
  Autocomplete,
  MenuItem,
  ListItemIcon,
  Menu,
  ListItemText,
} from "@mui/material";

import DateRangePicker, { useRangePicker } from "./dateRangePicker";

import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import SubjectIcon from "@mui/icons-material/Subject";
import Check from "@mui/icons-material/Check";

import { useSetRecoilState } from "recoil";
import { issueFilters } from "../../atoms/issueAtoms";

import { tokens } from "../../theme";

const FilterTools = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedCase, setSelectedCase] = useState("today");
  const [searchText, setSearchText] = useState("");

  const [getter, setter] = useRangePicker();

  const setFilters = useSetRecoilState(issueFilters);

  const [openFiltersWindow, setOpenFiltersWindow] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleFilters = (key, reset) => {
    if (reset) {
      setFilters({
        selectedCase: key ? key : selectedCase,
        selectedTarget: null,
        selectedRange: { startDate: "", endDate: "" },
        searchText: "",
      });
    } else {
      setFilters({
        selectedCase: key ? key : selectedCase,
        selectedTarget: selectedTarget,
        selectedRange: { ...getter },
        searchText: searchText,
      });
    }
  };

  return (
    <Box py={2}>
      <Menu
        id="show-menu"
        open={openMenu}
        anchorEl={anchorEl}
        MenuListProps={{
          "aria-labelledby": "show-button",
        }}
        onClose={() => {
          setAnchorEl(null);
        }}
        slotProps={{
          paper: {
            sx: {
              "& .MuiMenuItem-root.MuiButtonBase-root": {
                display: "flex",
                justifyContent: "space-between",
              },
            },
          },
        }}
      >
        {[
          { label: "Today", key: "today" },
          { label: "This week", key: "week" },
          { label: "This month", key: "month" },
          { label: "This quarter", key: "quarter" },
          { label: "This year", key: "year" },
          { label: "Special case", key: "special" },
          { label: "All", key: "all" },
        ].map((item) => {
          return (
            <MenuItem
              key={item.key}
              onClick={() => {
                setSelectedCase(item.key);
                handleFilters(item.key, true);
                setOpenFiltersWindow(false);
                setAnchorEl(null);

                setSearchText("");
                setSelectedTarget(null);
                setter.setStartDate("");
                setter.setEndDate("");
              }}
            >
              {selectedCase === item.key ? (
                <ListItemIcon>
                  <Check />
                </ListItemIcon>
              ) : null}

              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Paper
            component="form"
            sx={{
              backgroundColor: colors.primary[400],
              p: "2px 8px",
              display: "flex",
              alignItems: "center",
              width: "100%",
              borderRadius: "4px",
            }}
          >
            <IconButton
              id="show-button"
              type="button"
              aria-label="show"
              onClick={(event) => {
                setAnchorEl(event.currentTarget);
              }}
              aria-controls={openMenu ? "show-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? "true" : undefined}
            >
              <SubjectIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search Issue Problems"
              value={searchText}
              inputProps={{ "aria-label": "search issues" }}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  e.preventDefault();
                }
              }}
            />
            <IconButton
              type="button"
              sx={{ p: "10px" }}
              aria-label="search"
              onClick={() => {
                handleFilters();
              }}
            >
              <SearchIcon />
            </IconButton>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton
              disabled={selectedCase === "special"}
              sx={{ p: "10px" }}
              aria-label="directions"
              onClick={() => {
                setOpenFiltersWindow((open) => !open);
              }}
            >
              <FilterListIcon />
            </IconButton>
          </Paper>
        </Stack>
        <Collapse in={openFiltersWindow}>
          <Card variant="outlined" sx={{ background: colors.primary[400] }}>
            <CardHeader
              titleTypographyProps={{ variant: "h5" }}
              title="Filter options"
            />
            <CardContent>
              <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} sm={6} lg={4}>
                  <DateRangePicker getter={getter} setter={setter} />
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <Autocomplete
                    onChange={(_, value) => {
                      setSelectedTarget(value);
                    }}
                    value={selectedTarget}
                    options={props.targets.map(({ target }) => target)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="filled"
                        label="Target"
                        name="target"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                onClick={() => {
                  handleFilters();
                }}
                size="small"
                variant="contained"
                type="button"
                color="secondary"
              >
                Filter
              </Button>
              <Button
                onClick={() => {
                  handleFilters(undefined, true);

                  setSearchText("");
                  setSelectedTarget(null);
                  setter.setStartDate("");
                  setter.setEndDate("");
                }}
                variant="contained"
                size="small"
                type="reset"
                color="error"
              >
                Reset
              </Button>
            </CardActions>
          </Card>
        </Collapse>
      </Stack>
    </Box>
  );
};
export default FilterTools;
