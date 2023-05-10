import { Skeleton, styled, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Button } from "components";
import { MOBILE_WIDTH, TOOLBAR_WIDTH } from "consts";
import { theme } from "theme";


export const StyledEndAdornment = styled(Box)({
  button: {
    padding: "5px 10px",
    height: "unset",
    p: {
      fontSize: 12,
      display: "inline-block",
      overflow: "hidden",
      whiteSpace: "nowrap",
    },
    ".MuiCircularProgress-root": {
      width: "20px!important",
      height: "20px!important",
    },
  },
});



export const StyledFlexRow = styled(Box)(
  ({
    justifyContent = "center",
    alignItems = "center",
    gap = 10,
  }: {
    justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
    alignItems?: "flex-start" | "center" | "flex-end" | "space-between";
    gap?: number;
  }) => ({
    display: "flex",
    alignItems: alignItems,
    justifyContent,
    gap,
    width: "100%",
  })
);
export const StyledFlexColumn = styled(Box)(
  ({
    justifyContent = "center",
    alignItems = "center",
    gap = 10,
  }: {
    justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
    alignItems?: "flex-start" | "center" | "flex-end" | "space-between";
    gap?: number;
  }) => ({
    display: "flex",
    alignItems,
    justifyContent,
    flexDirection: "column",
    width: "100%",
    gap,
  })
);

export const globalStyles = {
  body: {
    background: "#F8F9FB",
  },
  "*::-webkit-scrollbar": {
    display: "none",
  },
  ".MuiPickersDay-today": {
    border: "unset!important",
  },

  ".go1858758034": {
    width: 18,
    height: 18,
  },
  html: {
    // scrollBehavior: "smooth" as const,
  },
  ".snackbar-success": {
    backgroundColor: `${theme.palette.primary.main}!important`,
  },
  ".MuiTooltip-arrow": {
    color: `#EEEEEE!important`,
  },
  ".MuiTooltip-tooltip": {
    background: `#EEEEEE!important`,
    boxShadow: "rgb(114 138 150 / 8%) 0px 2px 16px",
  },
  ".MuiDateCalendar-root .Mui-disabled": {
    opacity: "0.4!important",
    color: "gray!important",
  },
};

export const StyledGrid = styled(StyledFlexColumn)({
  gap: 0,
  width: "calc(100% - 100px)",
  maxWidth: 1100,
  marginLeft: "auto",
  paddingLeft: TOOLBAR_WIDTH,
  marginRight: "auto",
  "@media (max-width: 1100px)": {
    width: "calc(100% - 50px)",
  },
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    width: "calc(100% - 20px)",
    paddingLeft: "unset",
  },
});

export const StyledPage = styled(Box)({
  paddingTop: 100,
});

export const StyledSkeletonLoader = styled(Skeleton)({
  width: "100%",
  transform: "unset",
  background: "rgba(0,0,0, 0.07)",
});

export const StyledOneLine = styled(Typography)({
  display: "inline-block",
  overflow: "hidden",
  whiteSpace: "nowrap",
});

export const StyledTitle = styled(Typography)({
  color: "black",
  textAlign: "left",
  fontWeight: 700,
  lineHeight: "28px",
  fontSize: 20,
  "@media (max-width: 600px)": {
    fontSize: 18,
    lineHeight: "25px",
  },
});

export const StyledContainer = styled(Box)<{ hover?: number }>(
  ({ theme, hover }) => ({
    background: "white",
    border: "1px solid #e0e0e0",
    boxShadow: "rgb(114 138 150 / 8%) 0px 2px 16px",
    borderRadius: 10,
    padding: 20,
    transition: "0.2s all",
    svg: {
      transition: "0.2s all",
    },
    "&:hover": {
      border: hover &&  `1px solid ${theme.palette.primary.main}`,
      svg: {
        color: hover && `${theme.palette.primary.main}`,
      },
    },
  })
);

export const StyledEmptyText = styled(Typography)({
  fontSize: 18,
  fontWeight: 700,
});


export const StyledCreateAbout = styled(Typography)({
  fontSize: 14,
  opacity: 0.7,
  width:'100%',
  textAlign:'left'
});


export const StyledSelectContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  ".MuiInputBase-root": {
    borderRadius: 30,
  },
  ".MuiOutlinedInput-notchedOutline": {
    display: "none",
  },
  ".MuiSelect-select": {
    minWidth: 200,
    padding: "8px 15px 8px 15px",
    border: `1px solid rgba(211, 211, 211, 0.5)`,
    borderRadius: `30px!important`,
    transition: "0.2s all",
    "&:hover": {
      border: `1px solid ${theme.palette.primary.main}`,
    },
  },
  ".MuiSelect-icon": {
    width: 20,
    height: 20,
    marginTop: -2,
  },
}));


