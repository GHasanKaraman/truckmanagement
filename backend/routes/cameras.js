const express = require("express");
const router = express.Router();
const dgram = require("dgram");
const xml2js = require("xml2js");
const axios = require("axios");

const targetModel = require("../models/target");

const discoveredDevices = [];

function extractIpFromLocation(locationHeader) {
  const ipRegex = /http[s]?:\/\/([\d.]+):?\d*/;
  const match = locationHeader.match(ipRegex);
  return match ? match[1] : null;
}

async function getXML(location) {
  try {
    const response = await axios.get(location);
    return xml2js.parseStringPromise(response.data);
  } catch (error) {
    return undefined;
  }
}

router.get("/discover", async (req, res) => {
  try {
    const multicastAddress = "239.255.255.250";
    const multicastPort = 1900;

    const ipList = await targetModel.aggregate([
      { $match: { IP: { $ne: "" } } },
      { $project: { IP: 1, _id: 0, target: 1 } },
      { $unwind: "$IP" },
    ]);

    const message = Buffer.from(
      "M-SEARCH * HTTP/1.1\r\n" +
        "HOST: " +
        multicastAddress +
        ":" +
        multicastPort +
        "\r\n" +
        'MAN: "ssdp:discover"\r\n' +
        "MX: 2\r\n" +
        "ST: upnp:rootdevice\r\n" +
        "\r\n",
    );

    const client = dgram.createSocket("udp4");

    client.on("message", async (msg, rinfo) => {
      //console.log(`Received response from ${rinfo.address}:${rinfo.port}`);
      const deviceInfo = msg.toString();

      // Extract device details using regex or string manipulation
      const details = {};
      const lines = deviceInfo.split("\r\n");

      lines.forEach((line) => {
        const parts = line.split(": ");
        if (parts.length === 2) {
          const key = parts[0].trim().toLowerCase();
          const value = parts[1].trim();
          details[key] = value;
        }
      });

      details.IP = extractIpFromLocation(details.location);
      details.xml = await getXML(details.location);
      if (
        details["usn"] &&
        details["xml"] &&
        !discoveredDevices.some((device) => device.usn === details["usn"])
      ) {
        discoveredDevices.push(details);
        //console.log(`Discovered device: ${JSON.stringify(details)}`);
      }
    });

    client.on("error", (err) => {
      console.error(`Client error:\n${err.stack}`);
      client.close();
    });

    client.send(
      message,
      0,
      message.length,
      multicastPort,
      multicastAddress,
      (err) => {
        if (err) {
          console.error(`Error sending message: ${err}`);
          client.close();
          return res.status(500).send("Error sending multicast");
        }
        console.log(
          `Sent multicast message to ${multicastAddress}:${multicastPort}`,
        );
      },
    );

    // Wait for responses
    setTimeout(() => {
      client.close();
      res.status(200).json({ records: { cameras: discoveredDevices, ipList } }); // Send the discovered devices list
      discoveredDevices.length = 0; // Clear the list after sending (optional)
    }, 5000);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
module.exports = router;
