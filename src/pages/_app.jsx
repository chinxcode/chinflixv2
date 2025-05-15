import "@/styles/globals.css";
import Layout from "@/components/Layout";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from "next/head";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import PageTransition from "@/components/PageTransition";
import Script from "next/script";

export default function App({ Component, pageProps }) {
    const router = useRouter();

    return (
        <>
            <Head>
                <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            </Head>
            <Script
                src="https://cloud.umami.is/script.js"
                data-website-id="7707589d-1468-4162-a3be-00adc5282cb1"
                strategy="afterInteractive"
            />
            <Layout>
                <AnimatePresence mode="wait" initial={false}>
                    <PageTransition key={router.pathname}>
                        <Component {...pageProps} />
                    </PageTransition>
                </AnimatePresence>
                <Analytics />
                <SpeedInsights />
            </Layout>
        </>
    );
}
