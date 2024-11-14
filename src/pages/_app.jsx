import "@/styles/globals.css";
import Layout from "@/components/Layout";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from "next/head";

export default function App({ Component, pageProps }) {
    return (
        <>
            <Head>
                <link rel="shortcut icon" href="/icon.png" type="image/x-icon" />
            </Head>
            <Layout>
                <Component {...pageProps} />
                <Analytics />
                <SpeedInsights />
            </Layout>
        </>
    );
}
