import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function SimplePlayer({ option, captions, format, sources, ...rest }) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hlsRef = useRef(null);
    const settingsRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [selectedQuality, setSelectedQuality] = useState(null);
    const [selectedCaption, setSelectedCaption] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [buffered, setBuffered] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const controlsTimeoutRef = useRef(null);
    const touchStartRef = useRef({ x: 0, time: 0, count: 0 });
    const doubleTapTimeoutRef = useRef(null);
    const cursorTimeoutRef = useRef(null);
    const [showCursor, setShowCursor] = useState(true);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Click outside to close menus
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setShowSettings(false);
                setShowSpeedMenu(false);
                setShowQualityMenu(false);
                setShowSubtitleMenu(false);
                setShowDownloadMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Initialize video source
    useEffect(() => {
        if (!videoRef.current || !option?.url) return;

        const video = videoRef.current;
        const url = option.url;

        // console.log("Loading video URL:", url);

        // Clean up previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Check if it's an HLS stream
        if (url.includes(".m3u8")) {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });

                hls.loadSource(url);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log("HLS manifest parsed");
                    video.play().catch((e) => console.log("Autoplay prevented:", e));
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error("HLS error:", data);
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.log("Network error, trying to recover...");
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.log("Media error, trying to recover...");
                                hls.recoverMediaError();
                                break;
                            default:
                                console.log("Fatal error, destroying HLS instance");
                                hls.destroy();
                                break;
                        }
                    }
                });

                hlsRef.current = hls;
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                // Native HLS support (Safari)
                video.src = url;
            }
        } else {
            // Regular MP4 or other formats
            video.src = url;
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [option?.url]);

    // Video event listeners
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleDurationChange = () => setDuration(video.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleProgress = () => {
            if (video.buffered.length > 0) {
                setBuffered((video.buffered.end(0) / video.duration) * 100);
            }
        };

        // Set default subtitle to English if available
        const handleLoadedMetadata = () => {
            if (video.textTracks.length > 0 && !selectedCaption) {
                // Try to find English subtitle
                const englishTrack = Array.from(video.textTracks).find((track) => track.label?.toLowerCase().includes("english"));

                if (englishTrack) {
                    englishTrack.mode = "showing";
                    const englishCaption = captions?.find((c) => c.label === englishTrack.label);
                    if (englishCaption) {
                        setSelectedCaption(englishCaption);
                    }
                }
            }
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("durationchange", handleDurationChange);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("progress", handleProgress);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("durationchange", handleDurationChange);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("progress", handleProgress);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, [captions, selectedCaption]);

    // Fullscreen detection
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // Auto-hide controls
    const resetControlsTimeout = () => {
        setShowControls(true);
        setShowCursor(true);

        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (cursorTimeoutRef.current) {
            clearTimeout(cursorTimeoutRef.current);
        }

        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);

            cursorTimeoutRef.current = setTimeout(() => {
                setShowCursor(false);
            }, 3000);
        }
    };

    useEffect(() => {
        resetControlsTimeout();
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            if (cursorTimeoutRef.current) {
                clearTimeout(cursorTimeoutRef.current);
            }
        };
    }, [isPlaying]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Prevent if user is typing in an input
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

            const video = videoRef.current;
            if (!video) return;

            switch (e.key.toLowerCase()) {
                case " ":
                case "k":
                    e.preventDefault();
                    togglePlay();
                    break;
                case "arrowleft":
                case "j":
                    e.preventDefault();
                    skip(-10);
                    break;
                case "arrowright":
                case "l":
                    e.preventDefault();
                    skip(10);
                    break;
                case "arrowup":
                    e.preventDefault();
                    const newVolumeUp = Math.min(1, volume + 0.1);
                    video.volume = newVolumeUp;
                    setVolume(newVolumeUp);
                    setIsMuted(false);
                    break;
                case "arrowdown":
                    e.preventDefault();
                    const newVolumeDown = Math.max(0, volume - 0.1);
                    video.volume = newVolumeDown;
                    setVolume(newVolumeDown);
                    break;
                case "m":
                    e.preventDefault();
                    toggleMute();
                    break;
                case "f":
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case "0":
                case "home":
                    e.preventDefault();
                    video.currentTime = 0;
                    break;
                case "end":
                    e.preventDefault();
                    video.currentTime = video.duration;
                    break;
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    e.preventDefault();
                    const percent = parseInt(e.key) * 10;
                    video.currentTime = (video.duration * percent) / 100;
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyPress);
        return () => document.removeEventListener("keydown", handleKeyPress);
    }, [volume, isPlaying]);

    // Handlers
    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    };

    const handleVideoClick = (e) => {
        // Ignore if clicking on controls
        if (e.target.closest(".video-controls")) return;

        if (!isMobile) {
            togglePlay();
        }
    };

    const handleVideoDoubleClick = (e) => {
        // Ignore if clicking on controls
        if (e.target.closest(".video-controls")) return;

        if (!isMobile) {
            e.preventDefault();
            toggleFullscreen();
        }
    };

    const handleSeek = (e) => {
        const video = videoRef.current;
        if (!video) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    };

    const handleVolumeChange = (e) => {
        const video = videoRef.current;
        if (!video) return;

        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const skip = (seconds) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime += seconds;
    };

    const changePlaybackRate = (rate) => {
        const video = videoRef.current;
        if (!video) return;
        video.playbackRate = rate;
        setPlaybackRate(rate);
        setShowSpeedMenu(false);
        setShowSettings(false);
    };

    const changeQuality = (source) => {
        const video = videoRef.current;
        if (!video) return;

        const currentTime = video.currentTime;
        const wasPlaying = !video.paused;

        // Clean up HLS if needed
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Load new source
        if (source.url.includes(".m3u8")) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(source.url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.currentTime = currentTime;
                    if (wasPlaying) video.play();
                });
                hlsRef.current = hls;
            } else {
                video.src = source.url;
                video.currentTime = currentTime;
                if (wasPlaying) video.play();
            }
        } else {
            video.src = source.url;
            video.currentTime = currentTime;
            if (wasPlaying) video.play();
        }

        setSelectedQuality(source);
        setShowQualityMenu(false);
        setShowSettings(false);
    };

    const changeCaption = (caption) => {
        const video = videoRef.current;
        if (!video) return;

        // Remove existing tracks
        Array.from(video.textTracks).forEach((track) => {
            track.mode = "hidden";
        });

        if (caption && caption.file) {
            // Find track by matching the source URL
            const track = Array.from(video.textTracks).find((t) => {
                // Match by label or by checking if the track corresponds to this caption
                return t.label === caption.label;
            });
            if (track) {
                track.mode = "showing";
            }
        }

        setSelectedCaption(caption);
        setShowSubtitleMenu(false);
        setShowSettings(false);
    };

    // Touch controls for mobile (YouTube-style double tap)
    const handleTouchStart = (e) => {
        if (!isMobile) return;
        const touch = e.touches[0];
        touchStartRef.current.x = touch.clientX;
        touchStartRef.current.time = Date.now();
    };

    const handleTouchEnd = (e) => {
        if (!isMobile) return;
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaTime = Date.now() - touchStartRef.current.time;
        const screenWidth = window.innerWidth;

        // Quick tap (not a swipe)
        if (Math.abs(deltaX) < 50 && deltaTime < 300) {
            const tapX = touch.clientX;

            // Count taps for double tap detection
            touchStartRef.current.count += 1;

            // Clear previous timeout
            if (doubleTapTimeoutRef.current) {
                clearTimeout(doubleTapTimeoutRef.current);
            }

            // Check for double tap
            if (touchStartRef.current.count === 2) {
                // Double tap detected
                touchStartRef.current.count = 0;

                // Left third - rewind 10s
                if (tapX < screenWidth / 3) {
                    skip(-10);
                    showSkipAnimation("left");
                }
                // Right third - forward 10s
                else if (tapX > (screenWidth * 2) / 3) {
                    skip(10);
                    showSkipAnimation("right");
                }
                // Middle - toggle play
                else {
                    togglePlay();
                }
            } else {
                // Single tap - wait for potential second tap
                doubleTapTimeoutRef.current = setTimeout(() => {
                    // Single tap in middle - toggle controls
                    if (tapX >= screenWidth / 3 && tapX <= (screenWidth * 2) / 3) {
                        setShowControls(!showControls);
                    }
                    touchStartRef.current.count = 0;
                }, 300);
            }
        }
    };

    const showSkipAnimation = (direction) => {
        // Create and show skip animation
        const animDiv = document.createElement("div");
        animDiv.className = `absolute top-1/2 -translate-y-1/2 ${
            direction === "left" ? "left-8" : "right-8"
        } text-white text-6xl font-bold opacity-0 pointer-events-none`;
        animDiv.innerHTML = direction === "left" ? "⏪" : "⏩";
        animDiv.style.animation = "skipAnim 0.5s ease-out";

        containerRef.current?.appendChild(animDiv);

        setTimeout(() => {
            animDiv.remove();
        }, 500);
    };

    // Format time
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black group"
            style={{ cursor: showCursor ? "default" : "none" }}
            onMouseMove={resetControlsTimeout}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            {...rest}
        >
            <style jsx>{`
                @keyframes skipAnim {
                    0% {
                        opacity: 0;
                        transform: translateY(-50%) scale(0.5);
                    }
                    50% {
                        opacity: 1;
                        transform: translateY(-50%) scale(1.2);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-50%) scale(1);
                    }
                }
            `}</style>

            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full"
                onClick={!isMobile ? handleVideoClick : undefined}
                onDoubleClick={!isMobile ? handleVideoDoubleClick : undefined}
                playsInline
                crossOrigin="anonymous"
            >
                {captions?.map((caption, index) => (
                    <track
                        key={index}
                        kind="subtitles"
                        src={caption.file}
                        srcLang={caption.label}
                        label={caption.label}
                        default={caption.label?.toLowerCase().includes("english")}
                    />
                ))}
            </video>

            {/* Center Play Button (Desktop only) */}
            {!isPlaying && !isMobile && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <button
                        onClick={togglePlay}
                        className="pointer-events-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
                    >
                        <svg className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 md:p-4 transition-opacity duration-300 ${
                    showControls ? "opacity-100" : "opacity-0"
                }`}
            >
                {/* Progress Bar */}
                <div className="mb-2 md:mb-3 group/progress">
                    <div
                        className="h-1 md:h-1 bg-white/30 rounded-full cursor-pointer hover:h-2 transition-all relative"
                        onClick={handleSeek}
                    >
                        {/* Buffered */}
                        <div className="absolute h-full bg-white/40 rounded-full" style={{ width: `${buffered}%` }} />
                        {/* Progress */}
                        <div className="absolute h-full bg-red-500 rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }}>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 md:gap-3">
                    {/* Play/Pause */}
                    <button onClick={togglePlay} className="text-white hover:text-red-500 transition-colors p-1">
                        {isPlaying ? (
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    {/* Volume (Desktop only) */}
                    {!isMobile && (
                        <div className="hidden md:flex items-center gap-2 group/volume">
                            <button onClick={toggleMute} className="text-white hover:text-red-500 transition-colors p-1">
                                {isMuted || volume === 0 ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                                    </svg>
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-0 group-hover/volume:w-20 transition-all opacity-0 group-hover/volume:opacity-100"
                            />
                        </div>
                    )}

                    {/* Time */}
                    <span className="text-white text-xs md:text-sm whitespace-nowrap">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    <div className="flex-1" />

                    {/* Settings Button */}
                    <div className="relative" ref={settingsRef}>
                        <button
                            onClick={() => {
                                setShowSettings(!showSettings);
                                setShowSpeedMenu(false);
                                setShowQualityMenu(false);
                                setShowSubtitleMenu(false);
                                setShowDownloadMenu(false);
                            }}
                            className="text-white hover:text-red-500 transition-colors p-1"
                        >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                            </svg>
                        </button>

                        {/* Settings Menu */}
                        {showSettings && (
                            <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 min-w-[200px] md:min-w-[240px] overflow-hidden">
                                <button
                                    onClick={() => {
                                        setShowSpeedMenu(true);
                                        setShowSettings(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-gray-800 transition-colors text-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M10 8v8l6-4-6-4zm9 4c0 3.87-3.13 7-7 7s-7-3.13-7-7 3.13-7 7-7 7 3.13 7 7z" />
                                        </svg>
                                        <span>Speed</span>
                                    </div>
                                    <span className="text-gray-400 text-xs">{playbackRate === 1 ? "Normal" : `${playbackRate}x`}</span>
                                </button>

                                {sources && sources.length > 1 && (
                                    <button
                                        onClick={() => {
                                            setShowQualityMenu(true);
                                            setShowSettings(false);
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-gray-800 transition-colors text-sm border-t border-gray-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 14H3V5h18v12zm-5-6l-7 4V7z" />
                                            </svg>
                                            <span>Quality</span>
                                        </div>
                                        <span className="text-gray-400 text-xs">
                                            {selectedQuality?.quality || sources[0]?.quality || "Auto"}
                                        </span>
                                    </button>
                                )}

                                {captions && captions.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setShowSubtitleMenu(true);
                                            setShowSettings(false);
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-gray-800 transition-colors text-sm border-t border-gray-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z" />
                                            </svg>
                                            <span>Subtitles</span>
                                        </div>
                                        <span className="text-gray-400 text-xs">{selectedCaption?.label || "Off"}</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        setShowDownloadMenu(true);
                                        setShowSettings(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-gray-800 transition-colors text-sm border-t border-gray-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />
                                        </svg>
                                        <span>Download</span>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => {
                                        window.open(`https://www.watchparty.me/create?video=${encodeURIComponent(option.url)}`, "_blank");
                                        setShowSettings(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-gray-800 transition-colors text-sm border-t border-gray-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                        </svg>
                                        <span>Watch Party</span>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Speed Menu */}
                        {showSpeedMenu && (
                            <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 min-w-[200px] md:min-w-[240px] overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                                    <button
                                        onClick={() => {
                                            setShowSpeedMenu(false);
                                            setShowSettings(true);
                                        }}
                                        className="text-white hover:text-red-500"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                        </svg>
                                    </button>
                                    <span className="text-white font-semibold">Playback Speed</span>
                                </div>
                                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                    <button
                                        key={rate}
                                        onClick={() => changePlaybackRate(rate)}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-800 transition-colors ${
                                            playbackRate === rate ? "text-red-500 font-semibold" : "text-white"
                                        }`}
                                    >
                                        {rate === 1 ? "Normal" : `${rate}x`}
                                        {playbackRate === rate && (
                                            <svg className="w-4 h-4 inline-block ml-2" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Quality Menu */}
                        {showQualityMenu && sources && sources.length > 1 && (
                            <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 min-w-[200px] md:min-w-[240px] overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                                    <button
                                        onClick={() => {
                                            setShowQualityMenu(false);
                                            setShowSettings(true);
                                        }}
                                        className="text-white hover:text-red-500"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                        </svg>
                                    </button>
                                    <span className="text-white font-semibold">Quality</span>
                                </div>
                                {sources.map((source, index) => (
                                    <button
                                        key={index}
                                        onClick={() => changeQuality(source)}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-800 transition-colors ${
                                            selectedQuality?.url === source.url ? "text-red-500 font-semibold" : "text-white"
                                        }`}
                                    >
                                        {source.quality || "Unknown"}{" "}
                                        <span className="text-gray-400">({source.type?.toUpperCase() || "MP4"})</span>
                                        {selectedQuality?.url === source.url && (
                                            <svg className="w-4 h-4 inline-block ml-2" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Subtitle Menu */}
                        {showSubtitleMenu && (
                            <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 min-w-[200px] md:min-w-[240px] max-h-[300px] overflow-y-auto">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 sticky top-0 bg-gray-900">
                                    <button
                                        onClick={() => {
                                            setShowSubtitleMenu(false);
                                            setShowSettings(true);
                                        }}
                                        className="text-white hover:text-red-500"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                        </svg>
                                    </button>
                                    <span className="text-white font-semibold">Subtitles</span>
                                </div>
                                {captions && captions.length > 0 ? (
                                    <>
                                        <button
                                            onClick={() => changeCaption(null)}
                                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-800 transition-colors ${
                                                !selectedCaption ? "text-red-500 font-semibold" : "text-white"
                                            }`}
                                        >
                                            Off
                                            {!selectedCaption && (
                                                <svg className="w-4 h-4 inline-block ml-2" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                </svg>
                                            )}
                                        </button>
                                        {captions.map((caption, index) => (
                                            <button
                                                key={index}
                                                onClick={() => changeCaption(caption)}
                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-800 transition-colors ${
                                                    selectedCaption?.label === caption.label ? "text-red-500 font-semibold" : "text-white"
                                                }`}
                                            >
                                                {caption.label}
                                                {selectedCaption?.label === caption.label && (
                                                    <svg className="w-4 h-4 inline-block ml-2" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </>
                                ) : (
                                    <div className="px-4 py-8 text-center text-gray-400 text-sm">No subtitles available</div>
                                )}
                            </div>
                        )}

                        {/* Download Menu */}
                        {showDownloadMenu && (
                            <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 min-w-[200px] md:min-w-[240px] overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                                    <button
                                        onClick={() => {
                                            setShowDownloadMenu(false);
                                            setShowSettings(true);
                                        }}
                                        className="text-white hover:text-red-500"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                        </svg>
                                    </button>
                                    <span className="text-white font-semibold">Download Options</span>
                                </div>
                                {format === "hls" ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                window.open(
                                                    `https://hlsdownload.vidbinge.com/?url=${encodeURIComponent(option.url)}`,
                                                    "_blank"
                                                );
                                                setShowDownloadMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="font-semibold">VidBinge Downloader</div>
                                            <div className="text-xs text-gray-400 mt-1">Recommended for HLS streams</div>
                                        </button>
                                        <button
                                            onClick={() => {
                                                window.open(
                                                    `https://mediatools.cc/hlsDownloader?query=${encodeURIComponent(option.url)}`,
                                                    "_blank"
                                                );
                                                setShowDownloadMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-800 transition-colors border-t border-gray-800"
                                        >
                                            <div className="font-semibold">MediaTools Downloader</div>
                                            <div className="text-xs text-gray-400 mt-1">Alternative HLS downloader</div>
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigator?.clipboard?.writeText(option.url);
                                                window.open(
                                                    `https://hlsdownloader.thetuhin.com/?text=${encodeURIComponent(option.url)}`,
                                                    "_blank"
                                                );
                                                setShowDownloadMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-800 transition-colors border-t border-gray-800"
                                        >
                                            <div className="font-semibold">TheTuhin Downloader</div>
                                            <div className="text-xs text-gray-400 mt-1">URL copied to clipboard</div>
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            navigator?.clipboard?.writeText(option.url);
                                            window.open(option.url, "_blank");
                                            setShowDownloadMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="font-semibold">Download MP4</div>
                                        <div className="text-xs text-gray-400 mt-1">Direct download link</div>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Fullscreen */}
                    <button onClick={toggleFullscreen} className="text-white hover:text-red-500 transition-colors p-1">
                        {isFullscreen ? (
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Loading Indicator */}
            {duration === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
            )}
        </div>
    );
}
