import Web3 from "web3";
import { Multicall } from "ethereum-multicall";
import BN from "bignumber.js";

export class Multicaller {
  multicall: Multicall;

  pendingCalls: any[] = [];
  private _id: null | number = null;

  constructor(private web3: Web3) {
    this.multicall = new Multicall({ web3Instance: web3, tryAggregate: true });
  }

  addCall(address: string, abi: any, functions: Record<string, string[]>) {
    this.pendingCalls.push({
      reference: address,
      contractAddress: address,
      abi: abi,
      calls: Object.entries(functions).map(
        ([methodName, methodParameters]) => ({
          reference: methodName,
          methodName,
          methodParameters,
        })
      ),
    });

    return this;
  }

  async execute() {
    // This hack is for two purposes:
    // Reduce calls to get the id of the network (why would it change?)
    // Return the correct format when multicall (otherwise it's bignumber and multicall doesn't handle that)
    if (this._id === null) {
      this._id = Number(await this.web3.eth.net.getId());

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.web3.eth.net.getId = () => this._id;
    }

    const resp = await this.multicall.call(this.pendingCalls);

    return Object.fromEntries(
      Object.entries(resp?.results ?? {}).map(([token, result]) => {
        return [
          token,
          Object.fromEntries(
            result.callsReturnContext.map((c) => {
              let value = c.returnValues[0];

              if (value?.hex) {
                value = BN(value.hex).toString();
              }

              return [c.methodName, value];
            })
          ),
        ];
      })
    );
  }
}
