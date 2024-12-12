import QRCodeStyling from "qr-code-styling";

import truck from "../images/truck.gif";
import { useEffect, useRef } from "react";

const QRGenerator = (props) => {
  const { url, width } = props;
  const ref = useRef(null);

  const qrCode = new QRCodeStyling({
    width: width,
    height: width,
    data: url,
    margin: 0,
    qrOptions: { typeNumber: "0", mode: "Byte", errorCorrectionLevel: "Q" },
    imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0 },
    dotsOptions: {
      type: "extra-rounded",
      color: "#000",
    },
    backgroundOptions: { color: "#fff" },
    image: truck,
    dotsOptionsHelper: {
      colorType: { single: true, gradient: false },
      color: "#000",
    },
    cornersSquareOptions: { type: "dot", color: "#000" },
    cornersSquareOptionsHelper: {
      colorType: { single: true, gradient: false },
      gradient: {
        linear: true,
        radial: false,
        color1: "#000",
        color2: "#000",
        rotation: "0",
      },
    },
    cornersDotOptions: { type: "", color: "#000" },
    cornersDotOptionsHelper: {
      colorType: { single: true, gradient: false },
      gradient: {
        linear: true,
        radial: false,
        color1: "#000",
        color2: "#000",
        rotation: "0",
      },
    },
    backgroundOptionsHelper: {
      colorType: { single: true, gradient: false },
      gradient: {
        linear: true,
        radial: false,
        color1: "#fff",
        color2: " #fff",
        rotation: "0",
      },
    },
  });

  useEffect(() => {
    qrCode.append(ref.current);
  }, []);

  return <div ref={ref} />;
};

export default QRGenerator;
