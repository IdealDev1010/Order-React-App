import { IS_DEV, TONSCAN_ADDRESS_URL } from "config";
import _ from "lodash";
import timeZoneMoment from "moment-timezone";
import moment from "moment";
import { Address, fromNano } from "ton";
import {
  DaoRoles,
  ProposalMetadata,
  VotingPowerStrategy,
  VotingPowerStrategyType,
} from "ton-vote-contracts-sdk";
import {
  ProposalResults,
  ProposalStatus,
  RawVote,
  Vote,
  VotingPower,
} from "types";
import * as TonVoteSDK from "ton-vote-contracts-sdk";
import { FormikProps } from "formik";
import { WHITELISTED_DAOS, WHITELISTED_PROPOSALS } from "whitelisted";
import BigNumber from "bignumber.js";
import { ZERO_ADDRESS } from "consts";
import { errorToast } from "toasts";

export const makeElipsisAddress = (address?: string, padding = 6): string => {
  if (!address) return "";
  return `${address.substring(0, padding)}...${address.substring(
    address.length - padding
  )}`;
};

export const Logger = (log: any) => {
  if (import.meta.env.DEV) {
    console.log(log);
  }
};

export const parseVotes = (
  rawVotes: TonVoteSDK.Votes,
  votingPower: VotingPower
) => {
  let votes: Vote[] = _.map(rawVotes, (v: RawVote, key: string) => {
    const _votingPower = votingPower[key];

    return {
      address: key,
      vote: v.vote,
      votingPower: _votingPower ? fromNano(_votingPower) : "0",
      timestamp: v.timestamp,
      hash: v.hash,
    };
  });

  const sortedVotes = _.orderBy(votes, "timestamp", ["desc", "asc"]);
  return sortedVotes;
};

export function nFormatter(num: number, digits = 2) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  if (num < 1) {
    return num.toFixed(5).replace(rx, "$1");
  }
  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
}

export const getTimeDiff = (value: number, reverse?: boolean) => {
  var a = moment(unixToMilliseconds(value));
  var b = moment();

  const from = reverse ? b : a;
  const to = reverse ? a : b;

  const days = from.diff(to, "days");
  const hours = from.diff(to, "hours");
  const minutes = from.diff(to, "minutes");

  if (days > 0) {
    return days === 1 ? "1 day" : `${days} days`;
  }
  if (hours > 0) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }

  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
};

export const getProposalStatus = (
  proposalMetadata?: ProposalMetadata
): ProposalStatus | null => {
  if (!proposalMetadata) return null;
  const { proposalStartTime, proposalEndTime } = proposalMetadata;

  const now = moment.utc().valueOf();
  const voteStarted = unixToMilliseconds(Number(proposalStartTime)) <= now;
  const finished = unixToMilliseconds(Number(proposalEndTime)) <= now;

  return finished
    ? ProposalStatus.CLOSED
    : voteStarted && !finished
    ? ProposalStatus.ACTIVE
    : !voteStarted
    ? ProposalStatus.NOT_STARTED
    : null;
};

export const unixToMilliseconds = (value: Number) => {
  return moment.unix(Number(value)).valueOf();
};

export const urlPatternValidation = (URL: string) => {
  const regex = new RegExp(
    "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?"
  );
  return regex.test(URL);
};

export const getTonScanContractUrl = (address?: string) => {
  if (!address) return "";
  return `${TONSCAN_ADDRESS_URL}/${address}`;
};

export const calculateTonAmount = (percent?: number, total?: string) => {
  if (!percent || !total) return;
  const result = (Number(fromNano(total)) * percent) / 100;
  return nFormatter(result, 2);
};

export const getTonAmounFromSumCoins = (value?: BigNumber) => {
  if (!value) return "0";

  const amount = typeof value === "string" ? Number(value) : value.toNumber();

  return nFormatter(Number(fromNano(Math.round(amount))), 2);
};

export const validateAddress = (value?: string) => {
  if (!value) {
    return true;
  }
  try {
    return Address.isAddress(Address.parse(value));
  } catch (error) {
    return false;
  }
};

export async function validateFormik(formik: FormikProps<any>) {
  let value = "";
  await formik.validateForm().then((errors) => {
    if (!_.isEmpty(errors)) {
      const error = _.first(_.values(errors)) as string;
      value = error;
      error && errorToast(error);
    }
  });

  return value;
}

export function validateFormikSingleField<T>(
  formik: FormikProps<T>,
  name: string
) {
  formik.validateField(name);

  const error = formik.errors[name as keyof T] as string;

  if (error) {
    errorToast(error);
  }

  return error;
}

export const getSymbol = (votingPowerStrategy?: VotingPowerStrategyType) => {
  if (votingPowerStrategy == VotingPowerStrategyType.TonBalance) {
    return "TON";
  }
  if (votingPowerStrategy == VotingPowerStrategyType.JettonBalance) {
    return "Jetton";
  }
  if (votingPowerStrategy == VotingPowerStrategyType.NftCcollection) {
    return "NFT";
  }
};

export const normalizeResults = (
  proposalResult?: ProposalResults
): { title: string; percent: number }[] => {
  if (!proposalResult) return [];
  return _.map(proposalResult, (value, key) => {
    return {
      title: key,
      percent: value ? Number(value) : 0,
    };
  }).filter((it) => it.title !== "totalWeight");
};

export const parseLanguage = (json?: string, lang: string = "en") => {
  if (!json || !lang) return "";

  try {
    const parsed = JSON.parse(json);
    const value = parsed[lang];
    if (!value) {
      throw new Error("No value");
    }
    return value;
  } catch (error) {
    return json;
  }
};

export const isDaoWhitelisted = (address?: string) => {
  if (!address) return false;
  if (!_.size(WHITELISTED_DAOS)) return true;
  return WHITELISTED_DAOS.includes(address);
};

export const isProposalWhitelisted = (address?: string) => {
  if (!address) return false;
  if (!_.size(WHITELISTED_PROPOSALS)) return true;
  return WHITELISTED_PROPOSALS.includes(address);
};

export const isZeroAddress = (value?: string) => {
  return value === ZERO_ADDRESS;
};

export const getVoteStrategyType = (
  votingPowerStrategy?: VotingPowerStrategy[]
) => {
  return !votingPowerStrategy || !_.size(votingPowerStrategy)
    ? VotingPowerStrategyType.TonBalance
    : votingPowerStrategy[0].type;
};

export const getTxFee = (value: number, baseFee: number): string => {
  if(IS_DEV) return baseFee.toString();
  return Math.max(Number(value), baseFee).toString();
};

export const extractArg = (strategy: VotingPowerStrategy, name: string) => {
  return { [name]: strategy.arguments.find((it) => it.name === name)?.value };
};

export const extractStrategyArguments = (
  strategies?: VotingPowerStrategy[]
) => {
  if (!strategies) return {};
  let result: any = {};
  const args = _.flatMap(strategies, (it) => it.arguments);
  _.forEach(args, (it) => {
    result[it.name] = it.value;
  });

  return result;
};

export const getStrategyArgument = (
  name: string,
  strategies?: VotingPowerStrategy[]
) => {
  return extractStrategyArguments(strategies)[name];
};

export const utcMoment = (value?: number) => {
  const dt = value ? moment(value) : moment();

  const offset = dt.parseZone().utcOffset();

  return offset < 0
    ? dt.subtract(Math.abs(offset), "minutes")
    : dt.add(offset, "minutes");
};

export const validateServerUpdateTime = (
  server: number,
  local: number,
  value: number = 90_000
) => {
  const now = moment().valueOf();
  const diff = server - local;
  return diff >= value;
};
