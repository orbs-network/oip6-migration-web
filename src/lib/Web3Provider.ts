import BN from "bignumber.js";

import { Multicall, ContractCallResults } from "ethereum-multicall";
import { erc20ABI } from "wagmi";
import migrationAbi from "./oip6migration.abi.json";

import Web3, { Contract, ContractAbi } from "web3";
import { Multicaller } from "./multicaller";
import { toUI } from "./utils/toUI";

export class Web3Provider {
  multicall: Multicall;

  constructor(public web3: Web3) {
    this.multicall = new Multicall({ web3Instance: web3, tryAggregate: true });
  }

  private _id: number | null = null;

  async decimals(token: string) {
    const contract = this.getContract(erc20ABI, token);
    return Number(await contract.methods.decimals().call());
  }

  async tokenInfo(
    oldToken: string,
    newToken: string,
    account: string,
    migrationContract: string
  ): Promise<{
    old: {
      decimals: number;
      name: string;
      symbol: string;
      balanceOf: string;
      allowance: string;
      address: string;
      balanceOfUI: string;
      balanceMigrationContract: string;
      balanceMigrationContractUI: string;
    };
    new: {
      decimals: number;
      name: string;
      symbol: string;
      balanceOf: string;
      address: string;
      balanceOfUI: string;
      balanceMigrationContract: string;
      balanceMigrationContractUI: string;
    };
    migrationContract: { owner: string };
  }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = await new Multicaller(this.web3)
      .addCall(oldToken, erc20ABI, {
        decimals: [],
        name: [],
        symbol: [],
        balanceOf: [account],
        allowance: [account, migrationContract],
      })
      .addCall(newToken, erc20ABI, {
        decimals: [],
        name: [],
        symbol: [],
        balanceOf: [account],
      })
      .addCall(migrationContract, migrationAbi.abi, {
        owner: [],
      })
      .addCall(oldToken, erc20ABI, {
        balanceOf: [migrationContract],
      })
      .addCall(newToken, erc20ABI, {
        balanceOf: [migrationContract],
      })
      .execute();

    return {
      old: {
        ...results[0],
        address: oldToken,
        balanceOfUI: toUI(results[0].balanceOf, results[0].decimals),

        balanceMigrationContract: results[3].balanceOf,
        balanceMigrationContractUI: toUI(
          results[3].balanceOf,
          results[0].decimals
        ),
      },
      new: {
        ...results[1],
        address: newToken,
        balanceOfUI: toUI(results[1].balanceOf, results[1].decimals),
        balanceMigrationContract: results[4].balanceOf,
        balanceMigrationContractUI: toUI(
          results[4].balanceOf,
          results[1].decimals
        ),
      },
      migrationContract: {
        ...results[2],
      },
    };
  }

  getContract<T extends ContractAbi>(abi: T, address: string) {
    const contract = new Contract(abi, address);
    contract.setProvider(this.web3.currentProvider);
    return contract;
  }

  async balancesOf(account: string, tokens: string[]) {
    // This hack is for two purposes:
    // Reduce calls to get the id of the network (why would it change?)
    // Return the correct format when multicall (otherwise it's bignumber and multicall doesn't handle that)
    if (this._id === null) {
      this._id = Number(await this.web3.eth.net.getId());

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.web3.eth.net.getId = () => this._id;
    }

    const results: ContractCallResults = await this.multicall.call(
      tokens.map((token) => {
        return {
          reference: token,
          contractAddress: token,
          abi: [
            {
              constant: true,
              inputs: [
                {
                  name: "_owner",
                  type: "address",
                },
              ],
              name: "balanceOf",
              outputs: [
                {
                  name: "balance",
                  type: "uint256",
                },
              ],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
          ],
          calls: [
            {
              reference: "balanceOf",
              methodName: "balanceOf",
              methodParameters: [account],
            },
          ],
        };
      })
    );

    return Object.fromEntries(
      Object.entries(results.results).map(([token, result]) => {
        return [
          token,
          BN(result.callsReturnContext[0].returnValues[0]?.hex ?? 0).toString(),
        ];
      })
    );
  }

  // async waitForTransaction(txHash: string) {
  //   return promiseRetry(
  //     async (retry, retryNum) => {
  //       const { status } = await this.web3.eth
  //         .getTransactionReceipt(txHash)
  //         .catch(retry);

  //       if (!status) debug(`txn ${txHash} reverted`);

  //       return Boolean(status);
  //     },
  //     { retries: 5, factor: 1.6 }
  //   ).catch((e) => {
  //     debug(`txn ${txHash} not found`);
  //     return false;
  //   });
  // }
}
