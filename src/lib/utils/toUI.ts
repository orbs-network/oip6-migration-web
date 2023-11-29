import BN from "bignumber.js";
import { BNComparable } from "./BNComparable";


export function toUI(amount: BNComparable, decimals: number) {
  return new BN(amount).div(new BN(10).pow(decimals)).toString();
}
