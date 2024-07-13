export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'completeLending' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Principal],
        [IDL.Text],
        [],
      ),
    'completePurchase' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Principal],
        [IDL.Text],
        [],
      ),
    'getLentItemOriginalAdmin' : IDL.Func(
        [IDL.Principal],
        [IDL.Principal],
        ['query'],
      ),
    'getLentNFTs' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getListedNFTs' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getListedNFTsPrice' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getOpenDCanisterID' : IDL.Func([], [IDL.Principal], ['query']),
    'getOriginalOwner' : IDL.Func([IDL.Principal], [IDL.Principal], ['query']),
    'getOwnedNFTs' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'getRentItemOriginalAdmin' : IDL.Func(
        [IDL.Principal],
        [IDL.Principal],
        ['query'],
      ),
    'getRentNFTs' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getRentNFTsPrice' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'isLent' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'isListed' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'isRent' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'lentItem' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [IDL.Text],
        [],
      ),
    'listItem' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Text], []),
    'mint' : IDL.Func([IDL.Vec(IDL.Nat8), IDL.Text], [IDL.Principal], []),
    'rentItem' : IDL.Func([IDL.Principal, IDL.Nat, IDL.Nat], [IDL.Text], []),
    'returnLentItem' : IDL.Func([IDL.Principal], [IDL.Text], []),
    'returnRentItem' : IDL.Func([IDL.Principal], [IDL.Text], []),
    'unlistItem' : IDL.Func([IDL.Principal], [IDL.Text], []),
    'withdrawItem' : IDL.Func([IDL.Principal], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
