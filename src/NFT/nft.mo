import Debug "mo:base/Debug";
import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

// TODO : 複数オーナーを実現したい
// TODO : 画像だけでなく、書籍、音楽等、さまざまな形式に対応させたい
actor class NFT (name: Text, owner: Principal, content: [Nat8]) = this {

    // let: 再代入不可 var: 再代入可
    // private: 他のクラスやアクターに変更されない
    private let itemName = name;
    private var nftOwner = owner;
    private let imageBytes = content;

    public query func getName() : async Text {
        return itemName;
    };

    public query func getOwner() : async Principal {
        return nftOwner;
    };

    public query func getAsset() : async [Nat8] {
        return imageBytes;
    };

    public query func getCanisterId() : async Principal {
        // fromActor : アクターを引数に持ち、そのアクターのPrincipalを返す
        return Principal.fromActor(this);
    };

    public shared(msg) func transferOwnership(newOwner : Principal) : async Text {
        if (msg.caller == nftOwner) {
            nftOwner := newOwner;
            return "Success";
        } else {
            return "Error: Not initated by NFT Owner.";
        }
    };
};
