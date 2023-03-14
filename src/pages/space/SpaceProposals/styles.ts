import { Box, styled } from "@mui/material";
import { Container } from "components";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";

export const StyledLoader = styled(StyledSkeletonLoader)({
  height: 100,
});

export const StyledProposalsContainer = styled(Container)({
  flex: 1,
  gap: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

export const StyledProposalContent = styled(StyledFlexColumn)(({ theme }) => ({
  borderBottom: `1px solid lightgray`,
  paddingBottom: 20,
  marginBottom: 20,
  ".title": {
    fontSize: 18,
    fontWeight: 700,
  },
}));

export const StyledProposalResultProgress = styled("div")(({ theme }) => ({
  height: "100%",
  background: "black",
  position: "absolute",
  top: 0,
  left: 0,
  borderRadius: 5,
  opacity: 0.05,
}));

export const StyledProposalResultContent = styled(StyledFlexRow)({
  position: "relative",
  justifyContent: "space-between",
});

export const StyledProposalResult = styled(StyledFlexRow)({
  position: "relative",
  justifyContent: "flex-start",
  height: 40,
  paddingLeft: 10,
});

export const StyledProposalOwner = styled(StyledFlexRow)({
  justifyContent: "flex-start",
});

export const StyledProposal = styled(Box)({
  width: "100%",
  cursor: "pointer",
  ".description": {
    fontSize: 16,
  },
  ".time-left": {
    fontSize: 14,
  },
  ":last-child": {
    ".container": {
      border: "unset",
    },
  },
});
