import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "@/store/store";
import { Provider } from "react-redux";
import { SocketProvider } from "@/components/SocketProvider";
import { SocketApiProvider } from "@/socketApi/SocketApiProvider";
import { SpeechSynthesisProvider } from "@/components/SpeechSynthesisProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <SocketProvider>
        <SocketApiProvider>
          <SpeechSynthesisProvider>
            <Component {...pageProps} />
          </SpeechSynthesisProvider>
        </SocketApiProvider>
      </SocketProvider>
    </Provider>
  );
}
