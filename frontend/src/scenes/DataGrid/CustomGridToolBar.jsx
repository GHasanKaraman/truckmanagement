import {
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  GridToolbarExport,
} from "@mui/x-data-grid";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

import PropTypes from "prop-types";
import { TextField, IconButton, useTheme, Box } from "@mui/material";

import { tokens } from "../../theme";

import "./gridToolBar.css";

export function QuickSearchToolbar(props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box>
      <TextField
        autoFocus
        style={{ width: "100%", marginBottom: "15px" }}
        variant="standard"
        value={props.value}
        onChange={props.onChange}
        placeholder="Search…"
        InputProps={{
          startAdornment: (
            <SearchIcon fontSize="small" htmlColor={colors.ciboInnerGreen[300]} />
          ),
          endAdornment: (
            <IconButton
              title="Clear"
              aria-label="Clear"
              size="small"
              style={{ visibility: props.value ? "visible" : "hidden" }}
              onClick={props.clearSearch}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />
      <Box
        className="gridtoolbar"
        sx={{
          "& button": { color: colors.ciboInnerGreen[300] },
        }}
      >
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Box>
    </Box>
  );
}

QuickSearchToolbar.propTypes = {
  clearSearch: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

function escapeRegExp(value) {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export const requestSearch = (data, setData, searchValue) => {
  const searchRegex = new RegExp(escapeRegExp(searchValue), "i");
  const filteredData = data.filter((row) => {
    return Object.keys(row).some((field) => {
      return searchRegex.test(row[field].toString());
    });
  });
  setData(filteredData);
};
