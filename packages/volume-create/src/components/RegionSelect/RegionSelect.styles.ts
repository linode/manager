import { Box } from "@linode/ui";
import { styled } from "@mui/material/styles";

export const StyledAutocompleteContainer = styled(Box, {
  label: "RegionSelect",
})(({ theme }) => ({
  "& .MuiAutocomplete-groupLabel": {
    color: theme.color.headline,
    fontFamily: theme.font.bold,
    fontSize: "1rem",
    lineHeight: 1,
    padding: "16px 4px 8px 10px",
    textTransform: "initial",
  },
  "& .MuiAutocomplete-listbox": {
    "& li:first-of-type .MuiAutocomplete-groupLabel": {
      marginTop: -8,
    },
  },
  "& .MuiAutocomplete-root .MuiAutocomplete-inputRoot": {
    paddingRight: 8,
  },
  display: "flex",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));
