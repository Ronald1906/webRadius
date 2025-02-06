import "@/styles/globals.css";
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/md-light-indigo/theme.css'
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
