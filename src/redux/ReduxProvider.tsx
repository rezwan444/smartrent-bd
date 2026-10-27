"use client";

import { ChildrenProps } from "@/types/global";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store";
import { AuthInitializer } from "./AuthInitializer";

const ReduxProvider = ({ children }: ChildrenProps) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthInitializer />
        {children}
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;
