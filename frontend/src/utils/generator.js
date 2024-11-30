import PDFGenerator from "./pdfGenerator";
import React from "react";

class QRCodeGenerator extends React.Component {
  render() {
    const { url, part, location } = this.props;
    return (
      <div>
        <PDFGenerator url={url} part={part} location={location} />
      </div>
    );
  }
}

export default QRCodeGenerator;
