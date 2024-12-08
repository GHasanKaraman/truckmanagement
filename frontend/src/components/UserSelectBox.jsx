import { Avatar, Box, ButtonBase, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { IP } from "../env";

const UserSelectBox = ({
  technicians,
  onChange,
  initialValue = null,
  limit = undefined,
}) => {
  const [checkedList, setCheckedList] = useState({});
  const [_done, _set] = useState(false);

  const handleClick = (id) => {
    if (limit) {
      const { ...values } = checkedList;
      values[id] = !Boolean(values[id]);

      if (Object.values(values).filter((i) => i).length <= limit) {
        setCheckedList(values);
        const arr_values = [];
        for (let key in values) {
          if (values[key]) {
            arr_values.push(key);
          }
        }
        onChange(arr_values);
      }
    } else {
      const { ...values } = checkedList;
      values[id] = !Boolean(values[id]);
      setCheckedList(values);

      const arr_values = [];
      for (let key in values) {
        if (values[key]) {
          arr_values.push(key);
        }
      }
      onChange(arr_values);
    }
  };

  useEffect(() => {
    if (initialValue && !_done) {
      _set(true);
      setCheckedList(
        initialValue.reduce((acc, curr) => ((acc[curr] = true), acc), {}),
      );
    }
  }, [initialValue]);

  return (
    <Stack direction="column" spacing={1}>
      {technicians.map((technician) => {
        const status = Boolean(checkedList[technician._id]);
        return (
          <ButtonBase
            disableRipple
            key={technician._id}
            sx={{
              display: "inline-block !important",
              p: 1,
              borderRadius: 10,
              backgroundColor: status ? "rgba(0,0,0,0.1)" : undefined,
            }}
            onClick={() => handleClick(technician._id)}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", width: "100%" }}
            >
              {status ? (
                <Avatar
                  src={
                    "http://" +
                    IP +
                    "/uploads/thumbnail-" +
                    technician.image?.substring(
                      technician.image?.indexOf("/") + 1,
                    )
                  }
                />
              ) : (
                <Box
                  width={40}
                  height={40}
                  sx={{
                    backgroundColor: "#bdbdbd",
                    borderRadius: 20,
                    alignContent: "center",
                    textAlign: "-webkit-center",
                  }}
                >
                  <Box
                    width={20}
                    height={20}
                    sx={{ backgroundColor: "#fff", borderRadius: 10 }}
                  />
                </Box>
              )}
              <Typography
                color={status ? "green" : "rgba(0,0,0,0.3)"}
                fontWeight={700}
                fontSize={18}
              >
                {(technician.name + " " + technician.surname).toUpperCase()}
              </Typography>
            </Stack>
          </ButtonBase>
        );
      })}
    </Stack>
  );
};

export default UserSelectBox;
