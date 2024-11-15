import { useEffect, useRef, memo } from "react";
import dynamic from "next/dynamic";

const playM3u8 = async (video, url, art) => {
    const Hls = (await import("hls.js")).default;

    if (Hls.isSupported()) {
        if (art.hls) art.hls.destroy();
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        art.hls = hls;
        art.on("destroy", () => hls.destroy());
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
    } else {
        art.notice.show = "Unsupported playback format: m3u8";
    }
};

const AnimePlayer = memo(({ src }) => {
    const artRef = useRef();

    useEffect(() => {
        if (!src) return;
        let art;

        const initPlayer = async () => {
            const [{ default: Artplayer }, { default: artplayerPluginHlsQuality }] = await Promise.all([
                import("artplayer"),
                import("artplayer-plugin-hls-quality"),
            ]);

            art = new Artplayer({
                container: artRef.current,
                url: src,
                volume: 0.8,
                autoplay: false,
                autoSize: false,
                autoMini: true,
                loop: false,
                flip: true,
                playbackRate: true,
                aspectRatio: true,
                setting: true,
                hotkey: true,
                pip: true,
                lock: true,
                customType: {
                    m3u8: playM3u8,
                },
                controls: [
                    {
                        name: "skip-op",
                        position: "right",
                        html: '<div style="color:red; font-size:1.1rem; font-weight:600;">+85s</div>',
                        click: function () {
                            this.seek = this.currentTime + 85;
                        },
                    },
                ],
                plugins: [
                    artplayerPluginHlsQuality({
                        setting: true,
                        getResolution: (level) => (level.height ? `${level.height}p` : "Default"),
                        title: "Quality",
                        auto: "Auto",
                    }),
                ],
            });
        };

        initPlayer();

        return () => {
            if (art?.destroy) {
                art.destroy(false);
            }
        };
    }, [src]);

    return <div ref={artRef} className="w-full aspect-video bg-black/90" />;
});

AnimePlayer.displayName = "AnimePlayer";
export default AnimePlayer;
