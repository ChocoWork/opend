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
    // 売却するNFTに紐づける情報を格納する型の定義
    private type Listing = {
        itemOwner: Principal;
        itemPrice: Nat;
    };

    // 友人に貸出するNFTに紐づける情報を格納する型の定義
    private type Lending = {
        itemAdmin:  Principal;  // 貸出元のPrincipalID
        itemOwner:  Principal;  // 貸出先のPrincipalID
        itemDueDate:Nat;        // 貸出期限
        // lentDate:   Nat;        // 貸出し日
        // lentPeriod: Nat;        // 貸出日数
    };

    private type Rending = {
        itemAdmin:      Principal;  // 貸出元のPrincipalID
        // itemOwner:  Principal;  // 貸出先のPrincipalID
        itemRentPrice:  Nat;        // 貸出価格
        itemDueDate:    Nat;        // 貸出期限
        // RentDate:   Nat;        // 貸出し日
        // RentPeriod: Nat;        // 貸出日数
    };


    // キャニスターIDとNFTをハッシュマップで管理する
    var mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);

    // 自分が関連しているNFT（オーナーのIDとNFTのPrincipalIDをハッシュマップで管理）
    var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);

    // 売却リストに掲載のNFT（NFTのPrincipalIDと 販売履歴、売れたときの価格、日付などの情報を紐づける）
    var mapOfListings = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);

    // 友人に貸出するNFTのPrinipalIDと貸出価格を紐づける
    var mapOfLendings = HashMap.HashMap<Principal, Lending>(1, Principal.equal, Principal.hash);

    // システム経由で貸出するNFTのPrincipalIDと貸出価格を紐づける
    var mapOfRendings = HashMap.HashMap<Principal, Rending>(1, Principal.equal, Principal.hash);

    // *********************************************
    // function name : mint
    // function : アイテムを作成する
    // 実行条件  : none
    // 引数 :   imgData: [Nat8] = 画像データ　TODO：ItemCategoryごとにサポートするデータを切り替える（BookではEPUB、RWAでは複数画像）
    //          name: Text = アイテムの名前
    // *********************************************
    public shared(msg) func mint(imgData: [Nat8], name: Text) : async Principal {
        // ログインしているユーザーをオーナーとして登録する
        // TODO : 複数オーナーを実現したい
        let owner : Principal = msg.caller;

        Debug.print(debug_show(Cycles.balance()));

        // CAUTION : Cyclesは実験的なモジュールであるため、将来的にどうなるかまだ決まっていない
        // TODO : キャニスター作成と稼働に必要なサイクルを調べる
        // キャニスターを作成するときに必要なサイクルを追加する（1000億サイクル）
        // 稼働し続けるためのサイクルを追加する(50億)
        // ここでいう追加とは消費するサイクルの値として追加なので、サイクルが消費されることとなる
        // Cycles.add(100_500_000_000);
        let newNFT = await NFTActorClass.NFT(name, owner, imgData);

        Debug.print(debug_show(Cycles.balance()));

        // 新規作成したNFTのPrincipal IDを取得する
        let newPrincipal = await newNFT.getCanisterId();

        // ハッシュマップにキャニスターIDとNFTを紐づける
        mapOfNFTs.put(newPrincipal, newNFT);
        addToOwnershipMap(owner, newPrincipal);

        return newPrincipal;
    };

    // ******************************************************************************************
    // function name: addToOwnershipMap
    // function : ユーザーが現在所有しているNFTを管理するリストに、NFTを追加する
    // 実行条件  : none
    // 引数 :   owner: Principal = 登録するNFTの所有者
    //          nftId: Principal = 登録するNFTのID
    // ******************************************************************************************
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

    // ******************************************************************************************
    // function name: getOwnedNFTs
    // function : ユーザーが持っているすべてのNFTのPrincipalIDの配列を返す
    // 実行条件  : none
    // 引数 :   user : Principal = ユーザーのPrincipalID
    // ******************************************************************************************
    public query func getOwnedNFTs ( user : Principal ) : async [Principal] {
        var userNFTs : List.List<Principal> = switch (mapOfOwners.get(user)) {
            case null List.nil<Principal>(); // ユーザーが所有しているNFTがない場合、空のリストを返します
            case (?result) result; // ユーザーが所有しているNFTがある場合、そのリストを返します
        };

        // 配列の形式で値を返す
        return List.toArray(userNFTs);
    };

    // ******************************************************************************************
    // function name: listItem
    // function : リストされているすべてのNFTのPrincipalIDの配列を返す
    // 実行条件  : none
    // 引数 :   user : Principal = ユーザーのPrincipalID
    // ******************************************************************************************
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

    // ******************************************************************************************
    // function name: getListedNFTs
    // function : リストされているすべてのNFTのPrincipalIDの配列を返す
    // 実行条件  : none
    // 引数 :   user : Principal = ユーザーのPrincipalID
    // ******************************************************************************************
    public query func getListedNFTs () : async [Principal] {
        // mapOfListings.keys() : mapOfListingsのkeyをすべて取得する
        // Iter.toArray() : 取得したkeyを配列にする
        let ids = Iter.toArray(mapOfListings.keys());
        return ids;
    };

    // ******************************************************************************************
    // function name: isListed
    // function : NFTのキャニスターIDが売却リストに含まれているかを確認する
    // 実行条件  : none
    // 引数 :   id : Principal = ユーザーのID
    // ******************************************************************************************
    public query func isListed(id : Principal) : async Bool {
        if (mapOfListings.get(id) == null) {
            return false;
        } else {
            return true;
        }
    };

    // ******************************************************************************************
    // function name: getOriginalOwner
    // function : NFTのPrincipalIDを入力とし、実際に所有しているユーザー名を取得できる関数
    // 実行条件  : none
    // 引数 :   id : Principal = NFTのID
    // ******************************************************************************************
    public query func getOriginalOwner(id : Principal) : async Principal {
        var listing : Listing = switch (mapOfListings.get(id)) {
            case null return Principal.fromText("");
            case (?result) result;
        };

        return listing.itemOwner;
    };

    // ******************************************************************************************
    // function name: getListedNFTsPrice
    // function : NFTのPrincipalIDを入力とし、そのNFTの価格を取得できる関数
    // 実行条件  : none
    // 引数 :   id : Principal = NFTのID
    // ******************************************************************************************
    public query func getListedNFTsPrice(id : Principal) : async Nat {
        var listing : Listing = switch(mapOfListings.get(id)) {
            case null return 0;
            case (?result) result;
        };

        return listing.itemPrice;
    };

    
    // ******************************************************************************************
    // function name: completePurchase
    // function : 購入完了処理（Ownerの変更、売却リストからの削除、売却主が持っているリストからNFTのリストを削除する）
    // 実行条件  : none
    // 引数 :   id[Principal] : NFTのID
    //          ownerId[Principal] : NFTの現在の所有者のID
    //          newOwnerId[Principal] : NFTの送信先のID
    // ******************************************************************************************
    public func completePurchase(id: Principal, ownerId: Principal, newOwnerId: Principal) : async Text {
        // NFTのキャニスターIDに紐づくNFTを取得する
        var purchasedNFT : NFTActorClass.NFT = switch(mapOfNFTs.get(id)) {
            case null return "NFT does not exist";
            case (?result) result;
        };

        // 新しいオーナーに所有権を変更する
        let transferResult = await purchasedNFT.transferOwnership(newOwnerId, "buy");

        if (transferResult == "Success"){
            mapOfListings.delete(id); // NFTの出品リストから削除する

            // 出品者のIDに紐づくNFTのPrincipalIDのリストを取得する
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

            // 更新したリストをハッシュマップに再度格納する
            mapOfOwners.put(ownerId, ownedNFTs);

            // ユーザーが所持しているNFTのリストに、購入したNFTを追加する
            addToOwnershipMap(newOwnerId, id);
            return "Success";
        } else {
            return transferResult;
            // return "Error";
        }
    };

    // ******************************************************************************************
    // function name: unlistItem
    // function : 売却をキャンセルする。リストから削除する。
    // 実行条件  : none
    // 引数 :   id[Principal] : NFTのID
    // ******************************************************************************************
    public shared(msg) func unlistItem(id: Principal) : async Text {
        // NFTのキャニスターIDに紐づくNFTを取得する
        var listedNFT : NFTActorClass.NFT = switch(mapOfNFTs.get(id)) {
            case null return "NFT does not exist";
            case (?result) result;
        };

        // NFTの出品者かを確認する
        let nftAdmin = await listedNFT.getAdmin();
        let originalOwner = await getOriginalOwner(id);
        if (originalOwner == msg.caller and nftAdmin == msg.caller) {
            let transferResult = await listedNFT.transferOwnership(nftAdmin, "unlist");
            if (transferResult == "Success") {
                mapOfListings.delete(id); // NFTの出品リストから削除する

                return "Success";
            } else {
                return transferResult;
            }
        } else {
            return "You are not an exhibitor";
        }
    };

    // ******************************************************************************************
    // function name: lentItem
    // function : NFTのPrincipalIDを入力とし、そのNFTの価格を取得できる関数
    // 実行条件  : none
    // 引数 :   id : Principal          = NFTのID
    //          borrower : Principal    = 貸出先ユーザーのPrincipal ID
    //          dueDate : Nat           = 貸出期限
    // ******************************************************************************************
    public shared(msg) func lentItem(id : Principal, borrower : Principal, dueDate : Nat) : async Text {
        // キャニスターIDに紐づくNFTを取得する
        var nft : NFTActorClass.NFT = switch(mapOfNFTs.get(id)) {
            case null return "NFT does not exist.";
            case (?result) result;
        };

        let status = await nft.getStatus();
        if (status == #Own) { // NFTの状態がOwnであるかを確認する
            let admin  = await nft.getAdmin();
            if (Principal.equal(admin, msg.caller)) { // NFTの管理者が処理を実行しているのかを確認する
                let owner = await nft.getOwner(); // NFTのオーナーを取得する
                if (Principal.equal(owner, msg.caller)) { // NFTの持ち主が貸し出そうとしているのかを確認する
                    let newLending : Lending = {
                        itemAdmin = admin;      //貸出元のPrincipalID
                        itemOwner = owner;      //貸出先のPrincipalID
                        itemDueDate = dueDate;  //貸出期限
                    };
                    mapOfLendings.put(id, newLending);
                    addToOwnershipMap(borrower, id); // ユーザーが所持しているNFTのリストに、借りたNFTを追加する
                    return "Success";
                } else {
                    // Debug.printを使用してオーナーと呼び出し元を出力する
                    Debug.print("Owner: " # debug_show(owner));
                    Debug.print("Caller: " # debug_show(msg.caller));
                    return "You don't own NFT.";
                }
            } else {
                return "You are not an NFT administrator.";
            }
        } else {
            return "You do not have lending operation authorisation.";
        }
    };

    // ******************************************************************************************
    // function name: getLentNFTs
    // function : 友人に貸しているNFTのIDを返す
    // 実行条件  : none
    // 引数 :   none
    // 戻り値 : NFTのPrincipal ID
    // ******************************************************************************************
    public query func getLentNFTs () : async [Principal] {
        let ids = Iter.toArray(mapOfLendings.keys());
        return ids;
    };

    // ******************************************************************************************
    // function name: isLent
    // function : NFTのキャニスターIDが売却リストに含まれているかを確認する
    // 実行条件  : none
    // 引数 :   id : Principal = ユーザーのID
    // ******************************************************************************************
    public query func isLent(id : Principal) : async Bool {
        if (mapOfLendings.get(id) == null) {
            return false;
        } else {
            return true;
        }
    };

    // ******************************************************************************************
    // function name: getLentItemOriginalAdmin
    // function : NFTのPrincipalIDを入力とし、実際に所有しているユーザー名を取得できる関数
    // 実行条件  : none
    // 引数 :   id : Principal = NFTのID
    // ******************************************************************************************
    public query func getLentItemOriginalAdmin(id : Principal) : async Principal {
        var lending : Lending = switch (mapOfLendings.get(id)) {
            case null return Principal.fromText("");
            case (?result) result;
        };

        return lending.itemAdmin;
    };

    // ******************************************************************************************
    // function name: rentItem
    // function : NFTのPrincipalIDを入力とし、そのNFTの価格を取得できる関数
    // 実行条件  : none
    // 引数 :   id : Principal = NFTのID
    // ******************************************************************************************
    public shared(msg) func rentItem(id : Principal, price : Nat, dueDate : Nat) : async Text {
        // キャニスターIDに紐づくNFTを取得する
        var nft : NFTActorClass.NFT = switch(mapOfNFTs.get(id)) {
            case null return "NFT does not exist.";
            case (?result) result;
        };

        // TODO : 送信、貸出可能か？、送信したときの権利管理（貸出禁止、送信禁止など）の情報を付与する
        // let nonLending = item.getNonLending();
        // if (nonlending == true) {
            let status = await nft.getStatus();
            if (status == #Own) { // NFTの状態がOwnであるかを確認する
                let admin  = await nft.getAdmin();
                if (Principal.equal(admin, msg.caller)) { // NFTの管理者が処理を実行しているのかを確認する
                    let owner = await nft.getOwner(); // NFTのオーナーを取得する
                    if (Principal.equal(owner, msg.caller)) { // NFTの持ち主が貸し出そうとしているのかを確認する
                        // let priceMax = nft.getLendingPriceMax();
                        // let priceMin = nft.getLendingPriceMin();
                        // if (priceMin <= price and price <= priceMax) {
                            let newRending : Rending = {
                                itemAdmin = admin;      //貸出元のPrincipalID
                                // itemOwner = owner;      //貸出先のPrincipalID
                                itemRentPrice = price;        // 貸出価格
                                itemDueDate = dueDate;  //貸出期限
                            };
                            mapOfRendings.put(id, newRending);
                            return "Success";
                        // }
                    } else {
                        // Debug.printを使用してオーナーと呼び出し元を出力する
                        Debug.print("Owner: " # debug_show(owner));
                        Debug.print("Caller: " # debug_show(msg.caller));
                        return "You don't own NFT.";
                    }
                } else {
                    return "You are not an NFT administrator.";
                }
            } else {
                return "You do not have lending operation authorisation.";
            }
        // } else {
        //     return "Lending is prohibited by the author.";
        // }
    };

    // ******************************************************************************************
    // function name: getRentNFTs
    // function : システムに貸しているNFTのIDを返す
    // 実行条件  : none
    // 引数 :   none
    // 戻り値 : NFTのPrincipal ID
    // ******************************************************************************************
    public query func getRentNFTs () : async [Principal] {
        let ids = Iter.toArray(mapOfRendings.keys());
        return ids;
    };

    // ******************************************************************************************
    // function name: isRent
    // function : NFTのキャニスターIDが売却リストに含まれているかを確認する
    // 実行条件  : none
    // 引数 :   id : Principal = ユーザーのID
    // ******************************************************************************************
    public query func isRent(id : Principal) : async Bool {
        if (mapOfRendings.get(id) == null) {
            return false;
        } else {
            return true;
        }
    };

    // ******************************************************************************************
    // function name: getLentItemOriginalOwner
    // function : NFTのPrincipalIDを入力とし、実際に所有しているユーザー名を取得できる関数
    // 実行条件  : none
    // 引数 :   id : Principal = NFTのID
    // ******************************************************************************************
    public query func getRentItemOriginalAdmin(id : Principal) : async Principal {
        var rending : Rending = switch (mapOfRendings.get(id)) {
            case null return Principal.fromText("");
            case (?result) result;
        };

        return rending.itemAdmin;
    };

    // ******************************************************************************************
    // function name: getRentNFTsPrice
    // function : NFTのPrincipalIDを入力とし、実際に所有しているユーザー名を取得できる関数
    // 実行条件  : none
    // 引数 :   id : Principal = NFTのID
    // ******************************************************************************************
    public query func getRentNFTsPrice(id : Principal) : async Nat {
        var rending : Rending = switch (mapOfRendings.get(id)) {
            case null return 0;
            case (?result) result;
        };

        return rending.itemRentPrice;
    };

    // ******************************************************************************************
    // function name: completeLending
    // function : 貸出完了処理（Ownerの変更、売却リストからの削除、売却主が持っているリストからNFTのリストを削除する）
    // 実行条件  : none
    // 引数 :   id[Principal] : NFTのID
    //          ownerId[Principal] : NFTの現在の所有者のID
    //          newOwnerId[Principal] : NFTの送信先のID
    // ******************************************************************************************
    public func completeLending(id: Principal, ownerId: Principal, newOwnerId: Principal) : async Text {
        // NFTのキャニスターIDに紐づくNFTを取得する
        var purchasedNFT : NFTActorClass.NFT = switch(mapOfNFTs.get(id)) {
            case null return "NFT does not exist";
            case (?result) result;
        };

        // 新しいオーナーに所有権を変更する
        let transferResult = await purchasedNFT.transferOwnership(newOwnerId, "borrow");
        if (transferResult == "Success"){
            addToOwnershipMap(newOwnerId, id); // ユーザーが所持しているNFTのリストに、借りたNFTを追加する
            return "Success";
        } else {
            return transferResult;
        }
    };

    // ******************************************************************************************
    // function name: returnLentItem
    // function : 借りていたアイテムを持ち主に返却する。所有のリストから削除する。
    // 実行条件  : none
    // 引数 :   id[Principal] : NFTのID
    // ******************************************************************************************
    public shared(msg) func returnLentItem(id: Principal) : async Text {
        // NFTのキャニスターIDに紐づくNFTを取得する
        var rentNFT : NFTActorClass.NFT = switch(mapOfNFTs.get(id)) {
            case null return "NFT does not exist";
            case (?result) result;
        };

        // NFTの所有者かを確認する
        let nftOwner = await rentNFT.getOwner();
        if (nftOwner == msg.caller) {
            // 出品者のIDに紐づくNFTのPrincipalIDのリストを取得する
            var ownedNFTs : List.List<Principal> = switch(mapOfOwners.get(msg.caller)) {
                case null List.nil<Principal>();
                case (?result) result;
            };

            // 引数1のリストに対して、引数2でtrueを返すものだけをリストに残す
            // つまり、所有者が所有しているNFTのリスト（ownedNFTs）から特定のNFT（id）を削除している
            ownedNFTs := List.filter(ownedNFTs, func (listItemId: Principal) : Bool {
                // NFTのIDと一致するかを確認する
                return listItemId != id;
            });

            // 更新したリストをハッシュマップに再度格納する
            mapOfOwners.put(msg.caller, ownedNFTs);
            mapOfLendings.delete(id); // NFTの出品リストから削除する
            return "Success";
        } else {
            return "You are not an exhibitor";
        }
    };

    // ******************************************************************************************
    // function name: returnRentItem
    // function : 借りていたアイテムをシステムに返却する。所有のリストから削除する。
    // 実行条件  : none
    // 引数 :   id[Principal] : NFTのID
    // ******************************************************************************************
    public shared(msg) func returnRentItem(id: Principal) : async Text {
        // NFTのキャニスターIDに紐づくNFTを取得する
        var rentNFT : NFTActorClass.NFT = switch(mapOfNFTs.get(id)) {
            case null return "NFT does not exist";
            case (?result) result;
        };

        // NFTの所有者かを確認する
        let nftOwner = await rentNFT.getOwner();
        if (nftOwner == msg.caller) {
            // 出品者のIDに紐づくNFTのPrincipalIDのリストを取得する
            var ownedNFTs : List.List<Principal> = switch(mapOfOwners.get(msg.caller)) {
                case null List.nil<Principal>();
                case (?result) result;
            };

            // 引数1のリストに対して、引数2でtrueを返すものだけをリストに残す
            // つまり、所有者が所有しているNFTのリスト（ownedNFTs）から特定のNFT（id）を削除している
            ownedNFTs := List.filter(ownedNFTs, func (listItemId: Principal) : Bool {
                // NFTのIDと一致するかを確認する
                return listItemId != id;
            });

            // 更新したリストをハッシュマップに再度格納する
            mapOfOwners.put(msg.caller, ownedNFTs);
            return "Success";
        } else {
            return "You are not an exhibitor";
        }
    };

    // ******************************************************************************************
    // function name: withdrawItem
    // function : 売却をキャンセルする。リストから削除する。
    // 実行条件  : none
    // 引数 :   id[Principal] : NFTのID
    // ******************************************************************************************
    public shared(msg) func withdrawItem(id: Principal) : async Text {
        // NFTのキャニスターIDに紐づくNFTを取得する
        var lentNFT : NFTActorClass.NFT = switch(mapOfNFTs.get(id)) {
            case null return "NFT does not exist";
            case (?result) result;
        };

        // NFTの所有者かを確認する
        let originalAdmin = await getRentItemOriginalAdmin(id);
        let nftAdmin = await lentNFT.getAdmin();

        if (originalAdmin == msg.caller and nftAdmin == msg.caller) {
            let transferResult = await lentNFT.transferOwnership(nftAdmin, "withdraw");
            if (transferResult == "Success") {
                mapOfRendings.delete(id); // NFTの出品リストから削除する
                return "Success";
            } else {
                return transferResult;
            }
        } else {
            return "You are not an exhibitor";
        }
    };

    // ******************************************************************************************
    // function name: checkLoan
    // function : 貸し出しているアイテムの貸し出し期限切れをチェックする
    // 実行条件  : 1日ごとに実行する
    // 引数 :   id : Principal = NFTのID
    // ******************************************************************************************
    // public func checkLoans(id : Principal, currentDate: Nat) : async Text {
    //     // mapOfLendingのすべての要素に対してループを行います
    //     for ((nftID, lending) in mapOfLendings.entries()) {
    //         // itemDueDateよりcurrentDateが大きい場合、returnItem関数を呼び出します
    //         if (lending.itemDueDate < currentDate) {
    //             let _ = await returnItem(nftID); // 戻り値を無視する
    //         }
    //     };

    //     for ((nftID, lending) in mapOfRendings.entries()) {
    //         // itemDueDateよりcurrentDateが大きい場合、returnItem関数を呼び出します
    //         if (lending.itemDueDate < currentDate) {
    //             let _ = await returnItem(nftID); // 戻り値を無視する
    //         }
    //     };

    //     return "Success"; // 正常終了を示すために0を返します
    // };

    // ******************************************************************************************
    // function name: getOpenDCanisterID
    // function : openDのキャニスターIDを取得する
    // 実行条件  : none
    // 引数 :   none
    // ******************************************************************************************
    public query func getOpenDCanisterID() : async Principal {
        return Principal.fromActor(OpenD);
    };
};
