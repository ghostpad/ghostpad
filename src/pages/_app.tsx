import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "@/store/store";
import { Provider } from "react-redux";
import { SocketProvider } from "@/components/SocketProvider";
import { SocketApiProvider } from "@/socketApi/SocketApiProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <SocketProvider>
        <SocketApiProvider>
          <Component {...pageProps} />
        </SocketApiProvider>
      </SocketProvider>
    </Provider>
  );
}
