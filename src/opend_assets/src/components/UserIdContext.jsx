import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal"; // TODO: Mainnetへのデプロイ時に無効にする

// ユーザーIDを保存するためのContextを作成
const UserIdContext = createContext();

// TODO: Mainnetへのデプロイ時に無効にする
const principal = Principal.fromText("2vxsx-fae");

// ユーザーIDを提供するProviderコンポーネントを作成
export function UserIdProvider({ children }) {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  async function handleLogin() {
    // TODO: Mainnetへのデプロイ用
    // const authClient = await AuthClient.create();
    // await authClient.login({
    //   identityProvider: "https://identity.ic0.app",
    //   onSuccess: () => {
    //     const identity = authClient.getIdentity();
    //     const principal = identity.getPrincipal(); 
    //     console.log("identity: " + identity);
    //     console.log("principal: " + principal);
    //     setUserId(principal);
    //     // セッションストレージにprincipalを保存
    //     sessionStorage.setItem('userId', principal);　
    //   },
    // });

    // TODO: ローカルデバッグ用
    // ローカル環境でのテスト用に固定のPrincipal IDを使用
    const principal = Principal.fromText("2vxsx-fae");
    console.log("principal: " + principal);
    setUserId(principal);
    // セッションストレージにprincipalを保存
    sessionStorage.setItem('userId', principal);

  }

  return (
    <UserIdContext.Provider value={{ userId, setUserId, handleLogin }}>
      {children}
    </UserIdContext.Provider>
  );
}

// ユーザーIDを取得するためのカスタムフックを作成
export function useUserId() {
  const context = useContext(UserIdContext);
  if (context === undefined) {
    throw new Error('useUserId must be used within a UserIdProvider');
  }
  return context;
}
