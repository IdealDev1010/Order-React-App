import { getHttpEndpoint, getHttpV4Endpoint } from "@orbs-network/ton-access";
import { Address, beginCell, Cell, TonClient, TonClient4 } from "ton";
import BigNumber from "bignumber.js";
import _ from "lodash";

export const votingContract = Address.parse(
  "Ef-V3WPoPFeecWLT5vL41YIFrBFczkk-4sd3dhbJmO7McyEw"
);

export async function getClientV2(customEndpoint, apiKey) {
  // const endpoint = "https://ton.access.orbs.network/3847c20C2854E83765d585B86498eFcC7Fec6a46/1/mainnet/toncenter-api-v2/jsonRPC" // await getHttpEndpoint();
  if (customEndpoint) {
    return new TonClient({ endpoint: customEndpoint, apiKey });
  }
  const endpoint = await getHttpEndpoint();
  return new TonClient({ endpoint });
}

export async function getClientV4(customEndpoint) {
  const endpoint = customEndpoint || "https://mainnet-v4.tonhubapi.com";
  return new TonClient4({ endpoint });
}


export async function getTransactions(
  client,
  toLt = null
) {
  let maxLt = new BigNumber(toLt ?? -1);
  let startPage = { fromLt: "0", hash: "" }

  let allTxns = [];
  let paging = startPage;

  while (true) {
    console.log("Querying...");
    const txns = await client.getTransactions(votingContract, {
      lt: paging.fromLt,
      to_lt: toLt ?? undefined,
      hash: paging.hash,
      limit: 100,
    });

    console.log(`Got ${txns.length}, lt ${paging.fromLt}`);

    if (txns.length === 0) break;

    allTxns = [...allTxns, ...txns];

    paging.fromLt = txns[txns.length - 1].id.lt;
    paging.hash = txns[txns.length - 1].id.hash;
    txns.forEach((t) => {
      t.inMessage.source = t.inMessage.source.toFriendly();
      maxLt = BigNumber.max(new BigNumber(t.id.lt), maxLt);
    });
  }

  return { allTxns, maxLt: maxLt.toString() };
}

export function getAllVotes(transactions, proposalInfo) {
  let allVotes = {};

  for (let i = transactions.length - 1; i >= 0; i--) {
    const txnBody = transactions[i].inMessage.body;

    let vote = txnBody.text;
    if (!vote) continue;

    if (
      transactions[i].time < proposalInfo.startDate ||
      transactions[i].time > proposalInfo.endDate
    )
      continue;

    vote = vote.toLowerCase();

    if (["y", "yes"].includes(vote)) {
      allVotes[transactions[i].inMessage.source] = "Yes";
    } else if (["n", "no"].includes(vote)) {
      allVotes[transactions[i].inMessage.source] = "No";
    } else if (["a", "abstain"].includes(vote)) {
      allVotes[transactions[i].inMessage.source] = "Abstain";
    }
  }

  return allVotes;
}

export async function getVotingPower(
  clientV4,
  proposalInfo,
  transactions,
  votingPower = {}
) {
  let voters = Object.keys(getAllVotes(transactions, proposalInfo));

  let newVoters = [...new Set([...voters, ...Object.keys(votingPower)])];

  if (!newVoters) return votingPower;

  
  for (const voter of newVoters) {
    let voterAddr = Address.parse(voter);
    let snapsotBlock = voterAddr.workChain == -1 ? proposalInfo.snapshot.mcSnapshotBlock : proposalInfo.snapshot.wcSnapshotBlock
    votingPower[voter] = (
      await clientV4.getAccountLite(snapsotBlock, voterAddr)
    ).account.balance.coins;
  }

  return votingPower;
}

export function calcProposalResult(votes, votingPower) {
  let sumVotes = {
    yes: new BigNumber(0),
    no: new BigNumber(0),
    abstain: new BigNumber(0),
  };

  for (const [voter, vote] of Object.entries(votes)) {
    if (!(voter in votingPower))
      throw new Error(`voter ${voter} not found in votingPower`);

    if (vote === "Yes") {
      sumVotes.yes = new BigNumber(votingPower[voter]).plus(sumVotes.yes);
    } else if (vote === "No") {
      sumVotes.no = new BigNumber(votingPower[voter]).plus(sumVotes.no);
    } else if (vote === "Abstain") {
      sumVotes.abstain = new BigNumber(votingPower[voter]).plus(
        sumVotes.abstain
      );
    }
  }

  const totalWeights = sumVotes.yes.plus(sumVotes.no).plus(sumVotes.abstain);
  const yesPct = sumVotes.yes
    .div(totalWeights)
    .decimalPlaces(2)
    .multipliedBy(100)
    .toNumber();
  const noPct = sumVotes.no
    .div(totalWeights)
    .decimalPlaces(2)
    .multipliedBy(100)
    .toNumber();
  const abstainPct = sumVotes.abstain
    .div(totalWeights)
    .decimalPlaces(2)
    .multipliedBy(100)
    .toNumber();

  return {
    yes: yesPct,
    no: noPct,
    abstain: abstainPct,
    totalWeight: totalWeights.toString(),
  };
}

async function getBlockFromTime(clientV4, utime) {

  let mcSnapshotBlock = null;
  let wcSnapshotBlock = null;

  do {
    let res = (await clientV4.getBlockByUtime(utime)).shards;
  
    for (let i = 0; i < res.length; i++) {

      console.log(res[i].workchain, res[i].seqno);

      if (res[i].workchain == -1 && mcSnapshotBlock == null) {
        mcSnapshotBlock = res[i].seqno;
      }

      else if (res[i].workchain == 0 && wcSnapshotBlock == null) {
        wcSnapshotBlock = res[i].seqno;
      }
    }

    utime++;

  } while (mcSnapshotBlock == null || wcSnapshotBlock == null)

  return {mcSnapshotBlock, wcSnapshotBlock};

} 

export async function getSnapshotTime(client, clientV4) {
  const res = await client.callGetMethod(
    votingContract,
    "proposal_snapshot_time"
  );
  const snapshotTime = Number(res.stack[0][1]);

  res = getBlockFromTime(clientV4, snapshotTime);

  return {
    snapshotTime: snapshotTime, 
    mcSnapshotBlock: res.mcSnapshotBlock, 
    wcSnapshotBlock: res.wcSnapshotBlock
  };

}

export async function getStartTime(client) {
  const res = await client.callGetMethod(votingContract, "proposal_start_time");
  return Number(res.stack[0][1]);
}

export async function getEndTime(client) {
  const res = await client.callGetMethod(votingContract, "proposal_end_time");
  return Number(res.stack[0][1]);
}

export function getCurrentResults(transactions, votingPower, proposalInfo) {
  let votes = getAllVotes(transactions, proposalInfo);
  return calcProposalResult(votes, votingPower);
}

export async function getProposalInfo(client, clientV4) {
  return {
    startDate: await getStartTime(client),
    endDate: await getEndTime(client),
    snapshot: await getSnapshotTime(client, clientV4),
  };
}
