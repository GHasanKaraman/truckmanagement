import { atom, selector } from "recoil";
import moment from "moment-timezone";

export const issueFilters = atom({
  key: "issuePage",
  default: {
    selectedCase: "today",
    selectedRange: { startDate: "", endDate: "" },
    selectedTarget: null,
    searchText: "",
  },
});

export const issueFilterParams = selector({
  key: "issueFilterParams",
  get: ({ get }) => {
    const filters = get(issueFilters);
    return filters;
  },
});

export const issueSearchQueryParams = selector({
  key: "issueSearchQueryParams",
  get: ({ get }) => {
    const { selectedCase, selectedRange, selectedTarget, searchText } =
      get(issueFilters);
    var queryString = "";
    const { startDate, endDate } = selectedRange;
    if (startDate !== "" && endDate !== "") {
      if (selectedCase === "special") {
        queryString += "&show=special";
      }
      queryString += "&from=" + startDate + "&to=" + endDate;
    } else {
      queryString = "&show=" + selectedCase;
    }
    if (selectedTarget) {
      queryString += "&target=" + selectedTarget;
    }
    if (searchText !== "") {
      queryString += "&search=" + searchText;
    }

    return queryString;
  },
});
