import type { Principal } from '@dfinity/principal';
export interface NFT {
  'getAdmin' : () => Promise<Principal>,
  'getAsset' : () => Promise<Array<number>>,
  'getCanisterId' : () => Promise<Principal>,
  'getName' : () => Promise<string>,
  'getOwner' : () => Promise<Principal>,
  'getStatus' : () => Promise<Status>,
  'transferOwnership' : (arg_0: Principal) => Promise<string>,
}
export type Status = { 'Own' : null } |
  { 'Lending' : null } |
  { 'Listing' : null };
export interface _SERVICE extends NFT {}
