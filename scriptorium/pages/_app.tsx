import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";


export default function App({ Component, pageProps }: AppProps) {
  return (
      <>
          <nav className="flex flex-row bg-green-400 font-bold text-black px-5 py-3 gap-2 flex-wrap">
              <Link href="/">Home</Link>
              <div className="flex-1"/>
              <Link href="/login">Login</Link>

          </nav>
          <Component {...pageProps} />
      </>
  );
}
