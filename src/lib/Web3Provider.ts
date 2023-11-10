import BN from "bignumber.js";
// import { setWeb3Instance } from "@defi.org/web3-candies";

import { Multicall, ContractCallResults } from "ethereum-multicall";
import { erc20ABI } from "wagmi";

// import { _TypedDataEncoder } from "@ethersproject/hash";

import Web3, { Contract, ContractAbi } from "web3";

export class Web3Provider {
  multicall: Multicall;

  constructor(public web3: Web3) {
    // setWeb3Instance(this.web3);
    this.multicall = new Multicall({ web3Instance: web3, tryAggregate: true });
  }

  private _id: number | null = null;

  async decimals(token: string) {
    const contract = this.getContract(erc20ABI, token);
    return Number(await contract.methods.decimals().call());
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
