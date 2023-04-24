import { Typography, styled, Box, Alert } from "@mui/material";
import { AddressDisplay, Status, AppTooltip } from "components";
import { useDaoAddress } from "hooks";
import _ from "lodash";
import { useProposalQuery, useProposalStatusQuery } from "query/queries";
import { useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { ProposalMetadata, VotingPowerStrategy } from "ton-vote-contracts-sdk";
import { Proposal, ProposalStatus } from "types";
import {
  getTimeDiff,
  calculateTonAmount,
  normalizeResults,
  getSymbol,
} from "utils";
import { ProposalLoader } from "../ProposalLoader";
import removeMd from "remove-markdown";
import { useFilterValueByState, useFilterValueByText } from "./hooks";

import {
  StyledProposal,
  StyledProposalResult,
  StyledProposalResultContent,
  StyledProposalResultProgress,
} from "./styles";
import { typography } from "@mui/system";
import { useTranslation } from "react-i18next";

const Time = ({
  proposalMetadata,
  status,
}: {
  proposalMetadata: ProposalMetadata;
  status: ProposalStatus | null;
}) => {
  const { t } = useTranslation();
  if (!status) return null;

  if (status === ProposalStatus.NOT_STARTED) {
    return (
      <Typography className="time-left">
        {t("startIn", {
          value: getTimeDiff(proposalMetadata.proposalStartTime),
        })}
      </Typography>
    );
  }
  return (
    <Typography className="time-left">
      {t("endIn", { value: getTimeDiff(proposalMetadata.proposalEndTime) })}
    </Typography>
  );
};

const useHideProposal = (
  proposalAddress: string,
  proposal?: Proposal,
  status?: ProposalStatus | null
) => {
  const [queryParamState] = useFilterValueByState();
  const [queryParamText] = useFilterValueByText();

  const title = proposal?.metadata?.title.toLowerCase();
  const description = proposal?.metadata?.description.toLowerCase();

  const filters = [title, description, proposalAddress];

  if (queryParamState && queryParamState !== status) {
    return true;
  }

  if (
    queryParamText &&
    !filters.some((it) => {
      return it?.toLowerCase().includes(queryParamText.toLowerCase());
    })
  ) {
    return true;
  }

  return false;
};

export const ProposalComponent = ({
  proposalAddress,
}: {
  proposalAddress: string;
}) => {
  const { proposalPage } = useAppNavigation();
  const daoAddress = useDaoAddress();

  const { data: proposal, isLoading } = useProposalQuery(proposalAddress);

  const status = useProposalStatusQuery(proposal?.metadata, proposalAddress);
  const hideProposal = useHideProposal(proposalAddress, proposal, status);

  const onClick = () => {
    if (proposal?.url) {
      window.open(proposal.url);
    } else {
      proposalPage.root(daoAddress, proposalAddress);
    }
  };

  if (isLoading) {
    return <ProposalLoader />;
  }

  if (hideProposal) {
    return null;
  }
  return (
    <StyledProposal onClick={onClick}>
      <StyledFlexColumn alignItems="flex-start">
        <StyledFlexRow justifyContent="space-between">
          <AppTooltip text="Proposal address" placement="right">
            <AddressDisplay address={proposalAddress} />
          </AppTooltip>
          <Status status={status} />
        </StyledFlexRow>

        <StyledProposalTitle variant="h4">
          {proposal?.metadata?.title}
        </StyledProposalTitle>
        <StyledMarkdown
          sx={{
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
          }}
        >
          {removeMd(proposal?.metadata?.description || "", {
            useImgAltText: true,
          })}
        </StyledMarkdown>

        {status !== ProposalStatus.CLOSED && proposal?.metadata && (
          <Time proposalMetadata={proposal.metadata} status={status} />
        )}

        {!proposal?.hardcoded &&
          status === ProposalStatus.CLOSED &&
          proposal && <Results proposal={proposal} />}
      </StyledFlexColumn>
    </StyledProposal>
  );
};

const StyledMarkdown = styled(Typography)({
  fontWeight: 700,
  fontSize: 17,
});

const StyledProposalTitle = styled(Typography)({
  fontSize: 23,
  fontWeight: 800,
});

const Results = ({ proposal }: { proposal: Proposal }) => {
  const { proposalResult } = proposal;

  const { t } = useTranslation();

  const { totalWeight } = proposalResult;

  if (Number(totalWeight) === 0) {
    return (
      <StyledAlet severity="warning">
        <Typography>{t('endedAndDidntPassedQuorum')}</Typography>
      </StyledAlet>
    );
  }

  return (
    <StyledFlexColumn gap={5}>
      {normalizeResults(proposalResult)
        .filter((it) => it.title !== "totalWeight")
        .map((item) => {
          const { title, percent } = item;

          return (
            <Result
              votingPowerStrategy={proposal.metadata?.votingPowerStrategy}
              key={title}
              title={title}
              percent={percent}
              tonAmount={calculateTonAmount(percent, totalWeight as string)}
            />
          );
        })}
    </StyledFlexColumn>
  );
};

const StyledAlet = styled(Alert)({
  width: "100%",
  marginTop: 10,
});

const Result = ({
  title,
  percent = 0,
  tonAmount = "0",
  votingPowerStrategy,
}: {
  title: string;
  percent?: number;
  tonAmount?: string;
  votingPowerStrategy?: VotingPowerStrategy;
}) => {
  return (
    <StyledProposalResult>
      <StyledProposalResultProgress style={{ width: `${percent}%` }} />
      <StyledProposalResultContent>
        <StyledFlexRow justifyContent="flex-start">
          <Typography style={{ fontWeight: 700, textTransform: "capitalize" }}>
            {title}
          </Typography>
          <Typography fontSize={13}>
            {tonAmount} {getSymbol(votingPowerStrategy)}
          </Typography>
        </StyledFlexRow>
        <Typography style={{ fontWeight: 700 }}>{percent}%</Typography>
      </StyledProposalResultContent>
    </StyledProposalResult>
  );
};
