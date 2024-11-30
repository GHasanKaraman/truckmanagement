import React, { forwardRef, useEffect, useRef, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  CircleStencil,
  Cropper,
  RectangleStencil,
} from "react-advanced-cropper";
import "react-advanced-cropper/dist/themes/corners.css";
import "react-advanced-cropper/dist/style.css";
import { AddPhotoAlternate, Photo } from "@mui/icons-material";

const UploadImage = ({
  sx,
  src,
  stencil,
  onChange,
  error,
  helperText,
  value,
  formEdit = false,
  customRef,
  mode = "normal",
  iconStyle = undefined,
  button1 = { text: "CANCEL", color: "error" },
  button2 = { text: "RESET", color: "warning" },
  button3 = { text: "CROP", color: "success" },
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [openDialog, setOpenDialog] = useState(false);
  const [openShowDialog, setOpenShowDialog] = useState(false);

  const inputRef = useRef(null);
  const cropperRef = useRef(null);
  const [coordinates, setCoordinates] = useState(null);
  const [image, setImage] = useState("");
  const [croppedImage, setCroppedImage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [_i, _set] = useState(formEdit);
  const onCrop = () => {
    const cropper = cropperRef.current;

    if (cropper) {
      setOpenDialog(false);
      setCoordinates(cropper.getCoordinates());
      const canvas = cropper.getCanvas();
      setCroppedImage(canvas.toDataURL());
      canvas.toBlob((blob) => {
        if (blob) {
          onChange(blob);
        }
      }, "image/jpeg");
    }
  };

  const onLoadImage = (event) => {
    const file = event.target.files && event.target.files[0];

    if (file && file.type.includes("image")) {
      setImage(URL.createObjectURL(file));
      setOpenDialog(true);
    }
    event.target.value = "";
  };
  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  useEffect(() => {
    if (value === null) {
      URL.revokeObjectURL(image);
      setImage("");
      setCroppedImage("");
      setCoordinates(null);
      setEditMode(false);
    } else if (_i) {
      _set(false);
      setImage(value);
      setCroppedImage(value);
    }
  }, [value]);

  useEffect(() => {
    if (src && src !== null) {
      setImage(src);
      setCroppedImage(src);
    }
  }, [src]);

  const onCancel = () => {
    setOpenDialog(false);
    if (!editMode) {
      URL.revokeObjectURL(image);
      setImage("");
      setCroppedImage("");
      setCoordinates(null);
      setEditMode(false);
    }
  };

  return (
    <Stack sx={{ ...sx, alignItems: "center" }} spacing={1}>
      <Dialog
        fullScreen={fullScreen}
        open={openShowDialog}
        onClose={() => {
          setOpenShowDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Preview Image</DialogTitle>
        <DialogContent>
          {croppedImage !== "" ? (
            <Stack
              sx={{
                width: "200px",
                height: "200px",
                justifyContent: "center",
              }}
            >
              <Stack sx={{ position: "relative" }}>
                <Stack
                  sx={{
                    "&:hover": {
                      backgroundColor: "black",
                      transition: "0.5s",
                      opacity: "0.5",
                    },
                    "&:hover .icons": {
                      visibility: "visible",
                    },
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    opacity: "1",
                    borderRadius: stencil === "circle" ? "100px" : "0px",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={4}
                    className="icons"
                    sx={{
                      visibility: "hidden",
                      color: "white",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <IconButton
                      disableFocusRipple={true}
                      onClick={() => {
                        setOpenDialog(true);
                        setEditMode(true);
                      }}
                    >
                      <EditIcon sx={{ color: "white" }} />
                    </IconButton>

                    <IconButton
                      disableFocusRipple={true}
                      onClick={() => {
                        setOpenShowDialog(false);
                        setImage("");
                        setCroppedImage("");
                        onChange(null);
                        setCoordinates(null);
                        setEditMode(false);
                      }}
                    >
                      <DeleteIcon sx={{ color: "white" }} />
                    </IconButton>
                  </Stack>
                </Stack>
                <img
                  width={200}
                  style={{
                    borderRadius: stencil === "circle" ? "100px" : "0px",
                  }}
                  alt="cropped"
                  src={croppedImage}
                />
              </Stack>
            </Stack>
          ) : undefined}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setOpenShowDialog(false);
            }}
          >
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullScreen={fullScreen}
        open={openDialog}
        onClose={onCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Crop Image</DialogTitle>
        <DialogContent>
          <Cropper
            stencilComponent={
              stencil === "circle" ? CircleStencil : RectangleStencil
            }
            ref={cropperRef}
            defaultCoordinates={coordinates}
            src={image}
            stencilProps={{ grid: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color={button1.color} onClick={onCancel}>
            {button1.text}
          </Button>
          <Button
            variant="contained"
            color={button2.color}
            onClick={() => {
              cropperRef.current?.reset();
              if (!editMode) {
                setCoordinates(null);
              }
              setCoordinates(coordinates);
            }}
          >
            {button2.text}
          </Button>
          <Button
            variant="contained"
            color={button3.color}
            autoFocus
            onClick={onCrop}
          >
            {button3.text}
          </Button>
        </DialogActions>
      </Dialog>
      {croppedImage !== "" ? (
        mode === "mini" ? (
          <IconButton
            variant="outlined"
            onClick={() => {
              setOpenShowDialog(true);
            }}
          >
            <Photo sx={{ ...iconStyle }} />
          </IconButton>
        ) : mode === "custom" ? (
          <input
            ref={customRef}
            hidden
            accept="image/*"
            type="file"
            onChange={onLoadImage}
          />
        ) : (
          <Stack
            sx={{
              width: "200px",
              height: "200px",
              justifyContent: "center",
            }}
          >
            <Stack sx={{ position: "relative" }}>
              <Stack
                sx={{
                  "&:hover": {
                    backgroundColor: "black",
                    transition: "0.5s",
                    opacity: "0.5",
                  },
                  "&:hover .icons": {
                    visibility: "visible",
                  },
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  opacity: "1",
                  borderRadius: stencil === "circle" ? "100px" : "0px",
                }}
              >
                <Stack
                  direction="row"
                  spacing={4}
                  className="icons"
                  sx={{
                    visibility: "hidden",
                    color: "white",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <IconButton
                    disableFocusRipple={true}
                    onClick={() => {
                      setOpenDialog(true);
                      setEditMode(true);
                    }}
                  >
                    <EditIcon sx={{ color: "white" }} />
                  </IconButton>

                  <IconButton
                    disableFocusRipple={true}
                    onClick={() => {
                      setImage("");
                      setCroppedImage("");
                      onChange(null);
                      setCoordinates(null);
                      setEditMode(false);
                    }}
                  >
                    <DeleteIcon sx={{ color: "white" }} />
                  </IconButton>
                </Stack>
              </Stack>
              <img
                width={200}
                style={{
                  borderRadius: stencil === "circle" ? "100px" : "0px",
                }}
                alt="cropped"
                src={croppedImage}
              />
            </Stack>
          </Stack>
        )
      ) : mode === "mini" ? (
        <div>
          <input
            ref={inputRef}
            hidden
            accept="image/*"
            type="file"
            onChange={onLoadImage}
          />
          <IconButton
            variant="outlined"
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            <AddPhotoAlternate sx={{ ...iconStyle }} />
          </IconButton>
        </div>
      ) : mode === "custom" ? (
        <input
          ref={customRef}
          hidden
          accept="image/*"
          type="file"
          onChange={onLoadImage}
        />
      ) : (
        <IconButton
          color={error ? "error" : "secondary"}
          component="label"
          sx={{
            width: "100px",
            height: "100px",
            borderRadius: "1px",
            outline: "1px dashed",
            justifySelf: "center",
            gridColumn: "span 4",
          }}
        >
          <Stack direction="column" alignItems="center">
            <div>
              <UploadIcon fontSize="large" />
              Upload
            </div>
          </Stack>

          <input
            ref={inputRef}
            hidden
            accept="image/*"
            type="file"
            onChange={onLoadImage}
          />
        </IconButton>
      )}
      {mode !== "mini" ? (
        <div style={{ fontSize: "0.64rem", fontWeight: 400, color: "#d32f2f" }}>
          {helperText}
        </div>
      ) : undefined}
    </Stack>
  );
};

export default UploadImage;
