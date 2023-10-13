// import React from 'react'
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { store } from "./store/store.ts";
import { SocketProvider } from "./components/SocketProvider.tsx";
import { SocketApiProvider } from "./socketApi/SocketApiProvider.tsx";
import { SpeechSynthesisProvider } from "./components/SpeechSynthesisProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <SocketProvider>
      <SocketApiProvider>
        <SpeechSynthesisProvider>
          <App />
        </SpeechSynthesisProvider>
      </SocketApiProvider>
    </SocketProvider>
  </Provider>
);