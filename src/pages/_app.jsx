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
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no"
                />
                <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
                <meta name="theme-color" content="#121212" />
                <meta property="og:site_name" content="ChinFlix" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`https://chinflix.vercel.app${router.asPath}`} />
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/apple-icon-180.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="ChinFlix" />
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
