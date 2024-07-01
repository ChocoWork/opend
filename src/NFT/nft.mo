import Debug "mo:base/Debug";
import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

// TODO : 複数オーナーを実現したい
// TODO : 画像だけでなく、書籍、音楽等、さまざまな形式に対応させたい
actor class NFT (name: Text, owner: Principal, content: [Nat8]) = this {
    public type Status = {
        #Own;
        #Listing;
        #Lending;
    };

    // let: 再代入不可 var: 再代入可
    // private: 他のクラスやアクターに変更されない
    private let itemName = name;
    private var nftAdmin = owner;
    private var nftOwner = owner;
    private let imageBytes = content;
    private var itemStatus : Status = #Own;

    public query func getName() : async Text {
        return itemName;
    };

    public query func getAdmin() : async Principal {
        return nftAdmin;
    };

    private func changeAdmin(caller : Principal, newAdmin : Principal) : async Text {
        // Debug.print("itemStatus : " #debug_show(itemStatus));
        // Debug.print("caller : " #debug_show(caller));
        // Debug.print("nftOwner : " #debug_show(nftOwner));
        if (itemStatus == #Listing and caller == nftOwner) {
            nftAdmin := newAdmin;
            return "Success";
        } else {
            return "Error: Not initiated by NFT Admin.";
        }
    };

    public query func getOwner() : async Principal {
        return nftOwner;
    };

    private func changeOwner(caller : Principal, newOwner : Principal) : async Text {
        // callerがnftAdminの場合、システムから自分の手元に戻すことを意味する
        if (caller == nftOwner or caller == nftAdmin) {
            nftOwner := newOwner;
            return "Success";
        } else {
            return "Error: Not initiated by NFT Owner.";
        }
    };

    public query func getAsset() : async [Nat8] {
        return imageBytes;
    };

    public query func getStatus() : async Status {
        return itemStatus;
    };

    private func changeState(newStatus : Status) : async Text {
        // itemStatus := newStatus;
        // return "Success";
        if (itemStatus == #Own) {
            if (newStatus == #Listing or newStatus == #Lending) {
                itemStatus := newStatus;
                return "Success";
            } else {
                return "Error: Unexpected state transitions.";
            }
        } else if (itemStatus == #Listing) {
            if (newStatus == #Own) {
                itemStatus := newStatus;
                return "Success";
            } else {
                return "Error: Unexpected state transitions.";
            }
        } else if (itemStatus == #Lending) {
            if (newStatus == #Own){
                itemStatus := newStatus;
                return "Success";
            } else {
                return "Error: Unexpected state transitions.";
            }
        } else {
            return "Error: Unexpected state transitions.";
        }
    };

    public query func getCanisterId() : async Principal {
        // fromActor : アクターを引数に持ち、そのアクターのPrincipalを返す
        return Principal.fromActor(this);
    };

    // public shared(msg) func transferOwnership(newOwner : Principal) : async Text {
    //     if (msg.caller == nftOwner) {
    //         nftOwner := newOwner;
    //         return "Success";
    //     } else {
    //         return "Error: Not initated by NFT Owner.";
    //     }
    // };

    // --- Action ---
    public shared(msg) func transferOwnership(newOwner : Principal) : async Text {
        // --- Sell ---
        if (itemStatus == #Own and msg.caller == nftAdmin and msg.caller == nftOwner) {
            let changeOwnerResult = await changeOwner(msg.caller, newOwner);
            Debug.print("changeOwnerResult 1: " #debug_show(changeOwnerResult));
            if (changeOwnerResult == "Success") {
                let changeStateResult = await changeState(#Listing);
                Debug.print("changeStateResult : " #debug_show(changeStateResult));
                return changeStateResult;
            } else {
                return changeOwnerResult;
            }
        // --- Buy ---
        } else if (itemStatus == #Listing and nftAdmin != msg.caller and nftOwner == msg.caller) {
            let changeAdminResult = await changeAdmin(msg.caller, newOwner);
            Debug.print("changeAdminResult: " #debug_show(changeAdminResult));
            if (changeAdminResult == "Success") {
                let changeOwnerResult = await changeOwner(msg.caller, newOwner);
                Debug.print("changeOwnerResult 2: " #debug_show(changeOwnerResult));
                if (changeOwnerResult == "Success") {
                    let changeStateResult = await changeState(#Own);
                    Debug.print("changeStateResult 2: " #debug_show(changeStateResult));
                    return changeStateResult;
                } else {
                    return changeOwnerResult;
                }
            } else {
                return changeAdminResult;
            }
        // --- Unlist ---
        } else if (itemStatus == #Listing and nftAdmin == newOwner and nftOwner == msg.caller){
            let changeOwnerResult = await changeOwner(msg.caller, newOwner);
            if (changeOwnerResult == "Success") {
                let changeStateResult = await changeState(#Own);
                return changeStateResult;
            }
            else {
                return changeOwnerResult;
            }
        } else {
            return "Error: Not initiated by NFT Owner.";
        }
    };
};
