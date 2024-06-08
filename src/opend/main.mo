import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat8 "mo:base/Nat8";
import NFTActorClass "../NFT/nft";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
import Iter "mo:base/Iter";

actor OpenD {
    // 売却するNFTに紐づける情報を格納する新しい型を定義する
    // TODO : 送信、貸出可能か？、送信したときの権利管理（貸出禁止、送信禁止など）
    private type Listing = {
        itemOwner: Principal;
        itemPrice: Nat;
    };

    // キャニスターIDとNFTをハッシュマップで管理する
    var mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);

    // オーナーのIDとNFTのPrincipalIDをハッシュマップで管理する
    var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);

    // 売却するNFTのPrincipalIDと 販売履歴、売れたときの価格、日付などの情報を紐づける
    var mapOfListings = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);

    public shared(msg) func mint(imgData: [Nat8], name: Text) : async Principal {
        // ログインしているユーザーをオーナーとして登録する
        // TODO : 複数オーナーを実現したい
        let owner : Principal = msg.caller;

        Debug.print(debug_show(Cycles.balance()));

        // CAUTION : Cyclesは実験的なモジュールであるため、将来的にどうなるかまだ決まっていない
        // TODO : キャニスター作成と稼働に必要なサイクルを調べる
        // キャニスターを作成するときに必要なサイクルを追加する（1000億サイクル）
        // 稼働し続けるためのサイクルを追加する(50億)
        Cycles.add(100_500_000_000);
        let newNFT = await NFTActorClass.NFT(name, owner, imgData);

        Debug.print(debug_show(Cycles.balance()));

        // 新規作成したNFTのPrincipal IDを取得する
        let newPrincipal = await newNFT.getCanisterId();

        // ハッシュマップにキャニスターIDとNFTを紐づける
        mapOfNFTs.put(newPrincipal, newNFT);
        addToOwnershipMap(owner, newPrincipal);

        return newPrincipal;
    };

    // ユーザーが現在所有しているNFTリストに、NFTを追加する
    private func addToOwnershipMap(owner: Principal, nftId: Principal) {
        // `owner`が所有するNFTのリストを取得します。
        var ownedNFTs : List.List<Principal> = switch (mapOfOwners.get(owner)){
            // `owner`が`mapOfOwners`に存在しない場合、空のリストを返します。nil:空のリストを作成する
            case null List.nil<Principal>();
            // `owner`が`mapOfOwners`に存在する場合、その所有者が所有するNFTのリストを返します。
            case (?result) result;
        };

        // ユーザーが現在所有しているNFTのリストに新規で作成したNFTを追加する
        ownedNFTs := List.push(nftId, ownedNFTs);
        mapOfOwners.put(owner, ownedNFTs);
    };

    // ユーザーが持っているすべてのNFTのPrincipalIDの配列を返す
    public query func getOwnedNFTs ( user : Principal ) : async [Principal] {
        var userNFTs : List.List<Principal> = switch (mapOfOwners.get(user)) {
            case null List.nil<Principal>(); // ユーザーが所有しているNFTがない場合、空のリストを返します
            case (?result) result; // ユーザーが所有しているNFTがある場合、そのリストを返します
        };

        // 配列の形式で値を返す
        return List.toArray(userNFTs);
    };

    // リストされているすべてのNFTのPrincipalIDの配列を返す
    public query func getListedNFTs () : async [Principal] {
        // mapOfListings.keys() : mapOfListingsのkeyをすべて取得する
        // Iter.toArray() : 取得したkeyを配列にする
        let ids = Iter.toArray(mapOfListings.keys());
        return ids;
    };

    public shared(msg) func listItem(id : Principal, price : Nat) : async Text {
        // キャニスターIDに紐づくNFTを取得する
        var item : NFTActorClass.NFT = switch(mapOfNFTs.get(id)) {
            case null return "NFT does not exist.";
            case (?result) result;
        };

        // NFTのオーナーを取得する
        let owner = await item.getOwner();

        // Debug.printを使用してオーナーと呼び出し元を出力する
        Debug.print("Owner: " # debug_show(owner));
        Debug.print("Caller: " # debug_show(msg.caller));


        // NFTの持ち主が売却しようとしているのかを確認する
        if ( Principal.equal(owner, msg.caller)) {
            // TODO : 送信、貸出可能か？、送信したときの権利管理（貸出禁止、送信禁止など）の情報を付与する
            let newListing : Listing = {
                itemOwner = owner;
                itemPrice = price;
            };
            mapOfListings.put(id, newListing);
            return "Success";
        } else {
            return "You don't own NFT.";
        }
    };

    public query func getOpenDCanisterID() : async Principal {
        // opendのキャニスターIDを返す
        return Principal.fromActor(OpenD);
    };

    public query func isListed(id : Principal) : async Bool {
        // NFTのキャニスターIDが売却リストに含まれているかを確認する
        if (mapOfListings.get(id) == null) {
            return false;
        } else {
            return true;
        }
    };

    // NFTのPrincipalIDを入力とし、実際に所有しているユーザー名を取得できる関数
    public query func getOriginalOwner(id : Principal) : async Principal {
        var listing : Listing = switch (mapOfListings.get(id)) {
            case null return Principal.fromText("");
            case (?result) result;
        };

        return listing.itemOwner;
    };

    // NFTのPrincipalIDを入力とし、そのNFTの価格を取得できる関数
    public query func getListedNFTsPrice(id : Principal) : async Nat {
        var listing : Listing = switch(mapOfListings.get(id)) {
            case null return 0;
            case (?result) result;
        };

        return listing.itemPrice;
    };

    // オーナーを変更する
    // id[Principal] : NFTのID
    // ownerId[Principal] : NFTの現在の所有者のID
    // id[Principal] : NFTの送信先のID
    public func completePurchase(id: Principal, ownerId: Principal, newOwnerId: Principal) : async Text {
        // NFTのキャニスターIDに紐づくNFTを取得する
        var purchasedNFT : NFTActorClass.NFT = switch(mapOfNFTs.get(id)) {
            case null return "NFT does not exist";
            case (?result) result;
        };

        // 新しいオーナーに所有権を変更する
        let transferResult = await purchasedNFT.transferOwnership(newOwnerId);

        if (transferResult == "Success"){
            // 売却するNFTのリストから削除する
            mapOfListings.delete(id);

            // 販売元のオーナーのIDに紐づくNFTのPrincipalIDのリストを取得する
            var ownedNFTs : List.List<Principal> = switch(mapOfOwners.get(ownerId)) {
                case null List.nil<Principal>();
                case (?result) result;
            };
            
            // 引数1のリストに対して、引数2でtrueを返すものだけをリストに残す
            // つまり、所有者が所有しているNFTのリスト（ownedNFTs）から特定のNFT（id）を削除している
            ownedNFTs := List.filter(ownedNFTs, func (listItemId: Principal) : Bool {
                // NFTのIDと一致するかを確認する
                return listItemId != id;
            });

            // ユーザーが所持しているNFTのリストに、購入したNFTを追加する
            addToOwnershipMap(newOwnerId, id);
            return "Success";
        } else {
            return transferResult;
            // return "Error";
        }
    };
};
