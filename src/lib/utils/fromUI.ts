import BN from "bignumber.js";
import { BNComparable } from "./BNComparable";

export function fromUI(amount: BNComparable, decimals: number) {
  return new BN(amount).multipliedBy(new BN(10).pow(decimals)).toString(10);
}
