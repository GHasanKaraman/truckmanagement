import * as React from "react";
import { useGridApiContext } from "@mui/x-data-grid";
import { SliderPicker } from "react-color";
import { Box } from "@mui/system";

export function ColorPickerEditInputCell(props) {
  const { id, value, field } = props;
  const [pickerValue, setPickerValue] = React.useState(value);
  const apiRef = useGridApiContext();
  const ref = React.useRef();

  const handleChange = (color) => {
    apiRef.current.setEditCellValue({ id, field, value: color.hex });
  };

  return (
    <Box p="10px" sx={{ width: "100%" }}>
      <SliderPicker
        ref={ref}
        color={pickerValue}
        name="colorpicker"
        onChange={(color) => {
          setPickerValue(color.hex);
        }}
        onChangeComplete={handleChange}
      />
    </Box>
  );
}
