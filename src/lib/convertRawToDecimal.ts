import BN from "bignumber.js";


export function convertRawToDecimal(rawBalance: string, decimals: number) {
  return new BN(rawBalance).div(Math.pow(10, decimals)).toString();
}
