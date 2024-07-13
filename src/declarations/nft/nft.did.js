export const idlFactory = ({ IDL }) => {
  const Status = IDL.Variant({
    'Own' : IDL.Null,
    'Lending' : IDL.Null,
    'Listing' : IDL.Null,
  });
  const NFT = IDL.Service({
    'getAdmin' : IDL.Func([], [IDL.Principal], ['query']),
    'getAsset' : IDL.Func([], [IDL.Vec(IDL.Nat8)], ['query']),
    'getCanisterId' : IDL.Func([], [IDL.Principal], ['query']),
    'getName' : IDL.Func([], [IDL.Text], ['query']),
    'getOwner' : IDL.Func([], [IDL.Principal], ['query']),
    'getStatus' : IDL.Func([], [Status], ['query']),
    'transferOwnership' : IDL.Func([IDL.Principal, IDL.Text], [IDL.Text], []),
  });
  return NFT;
};
export const init = ({ IDL }) => {
  return [IDL.Text, IDL.Principal, IDL.Vec(IDL.Nat8)];
};
