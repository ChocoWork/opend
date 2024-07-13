import type { Principal } from '@dfinity/principal';
export interface _SERVICE {
  'completeLending' : (
      arg_0: Principal,
      arg_1: Principal,
      arg_2: Principal,
    ) => Promise<string>,
  'completePurchase' : (
      arg_0: Principal,
      arg_1: Principal,
      arg_2: Principal,
    ) => Promise<string>,
  'getLentItemOriginalAdmin' : (arg_0: Principal) => Promise<Principal>,
  'getLentNFTs' : () => Promise<Array<Principal>>,
  'getListedNFTs' : () => Promise<Array<Principal>>,
  'getListedNFTsPrice' : (arg_0: Principal) => Promise<bigint>,
  'getOpenDCanisterID' : () => Promise<Principal>,
  'getOriginalOwner' : (arg_0: Principal) => Promise<Principal>,
  'getOwnedNFTs' : (arg_0: Principal) => Promise<Array<Principal>>,
  'getRentItemOriginalAdmin' : (arg_0: Principal) => Promise<Principal>,
  'getRentNFTs' : () => Promise<Array<Principal>>,
  'getRentNFTsPrice' : (arg_0: Principal) => Promise<bigint>,
  'isLent' : (arg_0: Principal) => Promise<boolean>,
  'isListed' : (arg_0: Principal) => Promise<boolean>,
  'isRent' : (arg_0: Principal) => Promise<boolean>,
  'lentItem' : (arg_0: Principal, arg_1: Principal, arg_2: bigint) => Promise<
      string
    >,
  'listItem' : (arg_0: Principal, arg_1: bigint) => Promise<string>,
  'mint' : (arg_0: Array<number>, arg_1: string) => Promise<Principal>,
  'rentItem' : (arg_0: Principal, arg_1: bigint, arg_2: bigint) => Promise<
      string
    >,
  'returnLentItem' : (arg_0: Principal) => Promise<string>,
  'returnRentItem' : (arg_0: Principal) => Promise<string>,
  'unlistItem' : (arg_0: Principal) => Promise<string>,
  'withdrawItem' : (arg_0: Principal) => Promise<string>,
}
