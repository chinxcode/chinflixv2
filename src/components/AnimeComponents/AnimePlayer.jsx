import { useEffect, useRef } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import artplayerPluginHlsQuality from "artplayer-plugin-hls-quality";

const playM3u8 = (video, url, art) => {
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

const AnimePlayer = ({ src }) => {
    const artRef = useRef();

    useEffect(() => {
        if (!src) return;

        const art = new Artplayer({
            container: artRef.current,
            url: src,
            autoplay: false,
            autoSize: false,
            autoMini: true,
            loop: false,
            playbackRate: true,
            fullscreen: true,
            autoOrientation: true,
            aspectRatio: true,
            autoPlayback: true,
            setting: true,
            screenshot: true,
            miniProgressBar: true,
            hotkey: true,
            pip: true,
            airplay: true,
            lock: true,
            isLive: false,
            customType: {
                m3u8: playM3u8,
            },
            controls: [
                {
                    name: "skip-85",
                    position: "right",
                    html: "<div style='color:red; font-size:1.1rem; font-weight:600;'>+85s</div>",
                    click: function () {
                        this.seek = this.currentTime + 85;
                    },
                },
            ],
            plugins: [
                artplayerPluginHlsQuality({
                    setting: true,
                    getResolution: (level) => `${level.height !== 0 ? level.height + "p" : "Default"}`,
                    title: "Quality",
                    auto: "Auto",
                }),
            ],
        });

        return () => {
            if (art && art.destroy) {
                art.destroy(false);
            }
        };
    }, [src]);

    return <div ref={artRef} className="w-full aspect-video bg-black/90" />;
};

export default AnimePlayer;
