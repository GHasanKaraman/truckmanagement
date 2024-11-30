import moment from "moment-timezone";

export const b64EncodeUnicode = (str) => {
  return btoa(
    encodeURIComponent(str).replace(
      /%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode("0x" + p1);
      },
    ),
  );
};

export const ToLocalTime = (date) => {
  return moment(date).tz("America/New_York").format();
};

export const dateToPast = (date) => {
  date = ToLocalTime(date);
  const data = date.split("T");
  const dt = data[0];
  var time = data[1].split(".")[0].split(":");
  time = time[0] + ":" + time[1];
  return [dt, time];
};

export const toStringDate = (date, format) => {
  return new Date(date).toLocaleString("en-us", format);
};

export const numberToCurrency = (number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(number);
};

export const minuteDifference = (start, end) => {
  return Math.ceil(
    moment(end)
      .tz("America/New_York")
      .diff(moment(start).tz("America/New_York"), "minutes", true),
  );
};

export const getPartID = (partName, objectID) => {
  return partName.slice(0, 3) + objectID.slice(-6);
};

export const verifyPermissions = (raw, perms = "w", condition = false) => {
  const _all = [...perms];
  var result = false;

  if (condition) {
    _all.forEach((p) => {
      result &= raw.includes(p);
    });
  } else {
    _all.forEach((p) => {
      result |= raw.includes(p);
    });
  }

  return result;
};
