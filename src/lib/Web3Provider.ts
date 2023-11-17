import BN from "bignumber.js";

import { Multicall, ContractCallResults } from "ethereum-multicall";
import { erc20ABI } from "wagmi";

import Web3, { Contract, ContractAbi } from "web3";
import { Multicaller } from "./multicaller";

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
      isApproved: boolean;
      balanceOfUI: string;
    };
    new: {
      decimals: number;
      name: string;
      symbol: string;
      balanceOf: string;
      address: string;
      balanceOfUI: string;
    };
  }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any = await new Multicaller(this.web3)
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
      .execute();

    return {
      old: {
        ...results[oldToken],
        address: oldToken,
        balanceOfUI: new BN(results[oldToken].balanceOf)
          .div(new BN(10).pow(results[oldToken].decimals))
          .toString(),
        isApproved:
          new BN(results[oldToken].balanceOf).gt(0) &&
          new BN(results[oldToken].allowance).gte(results[oldToken].balanceOf),
      },
      new: {
        ...results[newToken],
        address: newToken,
        balanceOfUI: new BN(results[newToken].balanceOf)
          .div(new BN(10).pow(results[newToken].decimals))
          .toString(),
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
