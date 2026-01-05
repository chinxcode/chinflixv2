import { useEffect, useRef, useState } from "react";
import Artplayer from "artplayer";
import artplayerPluginHlsQuality from "artplayer-plugin-hls-quality";
import Hls from "hls.js";

export default function CustomPlayer({ option, captions, getInstance, format, sources, headers, ...rest }) {
    const artRef = useRef(null);
    const [currentSource, setCurrentSource] = useState(option);
    const artInstanceRef = useRef(null);

    function playM3u8(video, url, art) {
        if (Hls.isSupported()) {
            if (art.hls) art.hls.destroy();

            //if format is mp4 only then headers exist

            // const hlsConfig = {
            //     xhrSetup: function (xhr, url) {
            //         // Add custom headers if provided
            //         if (headers && typeof headers === "object") {
            //             Object.keys(headers).forEach((key) => {
            //                 xhr.setRequestHeader(key, headers[key]);
            //             });
            //         }
            //     },
            // };
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
    }

    useEffect(() => {
        const subtitles =
            captions?.length > 0
                ? [
                      {
                          default: false,
                          html: "Off",
                          url: "",
                      },
                      ...captions.map((ele, ind) => {
                          let def = false;
                          if (ele?.label?.toLowerCase()?.includes("english")) {
                              def = true;
                          }
                          return {
                              default: def,
                              html: ele?.label,
                              url: ele?.file,
                          };
                      }),
                  ]
                : [
                      {
                          default: true,
                          html: "No Captions Available",
                          url: "",
                      },
                  ];

        Artplayer.MOBILE_CLICK_PLAY = true;

        // Find default subtitle
        const defaultSubtitle = subtitles.find((s) => s.default && s.url) || null;

        // Prepare quality selector if we have multiple sources
        const qualitySelector = [];
        if (sources && sources.length > 1) {
            // Group by type (MP4 vs HLS)
            const mp4Sources = sources.filter((s) => s.type === "mp4");
            const hlsSources = sources.filter((s) => s.type === "m3u8");

            // Add MP4 qualities
            if (mp4Sources.length > 0) {
                mp4Sources.forEach((source, index) => {
                    qualitySelector.push({
                        html: `${source.quality || "Unknown"} (MP4)`,
                        url: source.url,
                        type: "mp4",
                        quality: source.quality,
                        default: index === 0 && currentSource.url === source.url,
                    });
                });
            }

            // Add HLS qualities
            if (hlsSources.length > 0) {
                hlsSources.forEach((source) => {
                    qualitySelector.push({
                        html: `${source.quality || "Unknown"} (HLS)`,
                        url: source.url,
                        type: "m3u8",
                        quality: source.quality,
                        default: currentSource.url === source.url,
                    });
                });
            }
        }

        const art = new Artplayer({
            ...currentSource,
            container: artRef.current,
            setting: true,
            fullscreen: true,
            autoOrientation: true,
            // autoSize: true,
            loop: false,
            isLive: false,
            autoPlayback: true,
            autoMini: true,
            flip: true,
            pip: true,
            playbackRate: true,
            aspectRatio: true,
            type: format === "hls" ? "m3u8" : "mp4",
            ...(defaultSubtitle && { subtitle: { url: defaultSubtitle.url, type: "srt", style: { color: "#fff" } } }),
            airplay: true,
            mutex: true,
            subtitleOffset: true,
            miniProgressBar: true,
            autoplay: false,
            hotkey: true,
            // Add custom headers to video element if provided and format is mp4
            ...(headers &&
                format !== "hls" && {
                    moreVideoAttr: {
                        crossOrigin: "anonymous",
                    },
                }),
            customType:
                format === "hls"
                    ? {
                          m3u8: playM3u8,
                      }
                    : {},
            settings: [
                {
                    html: "Subtitle",
                    width: 250,
                    tooltip: defaultSubtitle ? defaultSubtitle.html : "Off",
                    icon: '<svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools --> <title>ic_fluent_closed_caption_24_regular</title> <desc>Created with Sketch.</desc> <g id="🔍-Product-Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="ic_fluent_closed_caption_24_regular" fill="#ffffff" fill-rule="nonzero"> <path d="M18.75,4 C20.5449254,4 22,5.45507456 22,7.25 L22,16.754591 C22,18.5495164 20.5449254,20.004591 18.75,20.004591 L5.25,20.004591 C3.45507456,20.004591 2,18.5495164 2,16.754591 L2,7.25 C2,5.51696854 3.35645477,4.10075407 5.06557609,4.00514479 L5.25,4 L18.75,4 Z M18.75,5.5 L5.25,5.5 L5.10647279,5.5058012 C4.20711027,5.57880766 3.5,6.3318266 3.5,7.25 L3.5,16.754591 C3.5,17.7210893 4.28350169,18.504591 5.25,18.504591 L18.75,18.504591 C19.7164983,18.504591 20.5,17.7210893 20.5,16.754591 L20.5,7.25 C20.5,6.28350169 19.7164983,5.5 18.75,5.5 Z M5.5,12 C5.5,8.85441664 8.21322176,7.22468635 10.6216203,8.59854135 C10.981411,8.80378156 11.1066989,9.2618296 10.9014586,9.62162028 C10.6962184,9.98141095 10.2381704,10.1066989 9.87837972,9.90145865 C8.48070939,9.10416685 7,9.9935733 7,12 C7,14.0045685 8.48410774,14.8962094 9.8791978,14.102709 C10.2392458,13.8979206 10.6971362,14.0237834 10.9019246,14.3838314 C11.106713,14.7438795 10.9808502,15.2017699 10.6208022,15.4065583 C8.21538655,16.7747125 5.5,15.1433285 5.5,12 Z M13,12 C13,8.85441664 15.7132218,7.22468635 18.1216203,8.59854135 C18.481411,8.80378156 18.6066989,9.2618296 18.4014586,9.62162028 C18.1962184,9.98141095 17.7381704,10.1066989 17.3783797,9.90145865 C15.9807094,9.10416685 14.5,9.9935733 14.5,12 C14.5,14.0045685 15.9841077,14.8962094 17.3791978,14.102709 C17.7392458,13.8979206 18.1971362,14.0237834 18.4019246,14.3838314 C18.606713,14.7438795 18.4808502,15.2017699 18.1208022,15.4065583 C15.7153866,16.7747125 13,15.1433285 13,12 Z" id="🎨-Color"> </path> </g> </g> </g></svg>',
                    selector: subtitles,
                    onSelect: function (item, $dom, event) {
                        console.info(item, $dom, event);
                        if (item?.url) {
                            art.subtitle.url = item.url;
                        } else {
                            // Disable subtitle
                            art.subtitle.url = "";
                        }
                        // Update tooltip to show current selection
                        this.tooltip = item?.html;
                        return item?.html;
                    },
                },
                // Add quality selector if multiple sources available
                ...(qualitySelector.length > 1
                    ? [
                          {
                              html: "Quality",
                              width: 250,
                              tooltip: qualitySelector.find((q) => q.default)?.html || qualitySelector[0]?.html || "Auto",
                              icon: '<svg fill="#ffffff" viewBox="0 0 32 32" id="icon" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.cls-1{fill:none;}</style></defs><title>HD</title><path d="M28,6H4A2,2,0,0,0,2,8V24a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V8A2,2,0,0,0,28,6ZM4,24V8H28V24Z"></path><path d="M22,11H18V21h4a3,3,0,0,0,3-3V14A3,3,0,0,0,22,11Zm1,7a1,1,0,0,1-1,1H20V13h2a1,1,0,0,1,1,1Z"></path><polygon points="13 11 13 15 10 15 10 11 8 11 8 21 10 21 10 17 13 17 13 21 15 21 15 11 13 11"></polygon><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"></rect></g></svg>',
                              selector: qualitySelector,
                              onSelect: function (item) {
                                  const currentTime = art.currentTime;
                                  const isPlaying = !art.paused;

                                  // Properly pause before switching
                                  if (isPlaying) {
                                      art.pause();
                                  }

                                  // Switch to new source
                                  art.switchUrl(item.url, item.html);

                                  // Wait for video to be ready before restoring state
                                  setTimeout(() => {
                                      art.currentTime = currentTime;
                                      if (isPlaying) {
                                          art.play().catch((err) => {
                                              console.error("Autoplay error:", err);
                                          });
                                      }
                                  }, 100);

                                  art.notice.show = `Switched to ${item.html}`;
                                  // Update tooltip to show current selection
                                  this.tooltip = item.html;
                                  return item.html;
                              },
                          },
                      ]
                    : []),
                {
                    html: "Watch Party",
                    width: 250,
                    height: 500,
                    icon: '<svg height="200px" width="200px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#ffffff;} </style> <g> <path class="st0" d="M435.95,287.525c32.51,0,58.87-26.343,58.87-58.853c0-32.51-26.361-58.871-58.87-58.871 c-32.502,0-58.863,26.361-58.863,58.871C377.088,261.182,403.448,287.525,435.95,287.525z"></path> <path class="st0" d="M511.327,344.251c-2.623-15.762-15.652-37.822-25.514-47.677c-1.299-1.306-7.105-1.608-8.673-0.636 c-11.99,7.374-26.074,11.714-41.19,11.714c-15.099,0-29.184-4.34-41.175-11.714c-1.575-0.972-7.373-0.67-8.672,0.636 c-2.757,2.757-5.765,6.427-8.698,10.683c7.935,14.94,14.228,30.81,16.499,44.476c2.27,13.7,1.533,26.67-2.138,38.494 c13.038,4.717,28.673,6.787,44.183,6.787C476.404,397.014,517.804,382.987,511.327,344.251z"></path> <path class="st0" d="M254.487,262.691c52.687,0,95.403-42.716,95.403-95.402c0-52.67-42.716-95.386-95.403-95.386 c-52.678,0-95.378,42.716-95.378,95.386C159.109,219.975,201.808,262.691,254.487,262.691z"></path> <path class="st0" d="M335.269,277.303c-2.07-2.061-11.471-2.588-14.027-1.006c-19.448,11.966-42.271,18.971-66.755,18.971 c-24.466,0-47.3-7.005-66.738-18.971c-2.555-1.583-11.956-1.055-14.026,1.006c-16.021,16.004-37.136,51.782-41.384,77.288 c-10.474,62.826,56.634,85.508,122.148,85.508c65.532,0,132.639-22.682,122.165-85.508 C372.404,329.085,351.289,293.307,335.269,277.303z"></path> <path class="st0" d="M76.049,287.525c32.502,0,58.862-26.343,58.862-58.853c0-32.51-26.36-58.871-58.862-58.871 c-32.511,0-58.871,26.361-58.871,58.871C17.178,261.182,43.538,287.525,76.049,287.525z"></path> <path class="st0" d="M115.094,351.733c2.414-14.353,9.225-31.253,17.764-46.88c-2.38-3.251-4.759-6.083-6.955-8.279 c-1.299-1.306-7.097-1.608-8.672-0.636c-11.991,7.374-26.076,11.714-41.182,11.714c-15.108,0-29.202-4.34-41.183-11.714 c-1.568-0.972-7.382-0.67-8.681,0.636c-9.887,9.854-22.882,31.915-25.514,47.677c-6.468,38.736,34.924,52.762,75.378,52.762 c14.437,0,29.016-1.777,41.459-5.84C113.587,379.108,112.757,365.835,115.094,351.733z"></path> </g> </g></svg>',
                    selector: [
                        {
                            html: "watchparty.me",
                            url: "https://www.watchparty.me/create?video=" + currentSource?.url,
                        },
                    ],
                    onSelect: function (item) {
                        let url = `https://www.watchparty.me/create?video=${currentSource.url}`;
                        window.open(url, "_blank");
                        art.notice.show = "Opening Watch Party...";
                    },
                },
                {
                    html: "Download",
                    width: 250,
                    height: 500,
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>',
                    selector:
                        format === "hls"
                            ? [
                                  {
                                      html: "Download HLS (Recommended)",
                                      url: currentSource.url,
                                      opt: 1,
                                  },
                                  {
                                      html: "Download HLS (mediatools)",
                                      url: currentSource.url,
                                      opt: 2,
                                  },
                                  {
                                      html: "Download HLS (thetuhin)",
                                      url: currentSource.url,
                                      opt: 3,
                                  },
                              ]
                            : [
                                  {
                                      html: "Download mp4",
                                      url: currentSource.url,
                                      opt: 4,
                                  },
                              ],
                    onSelect: function (item) {
                        if (item.opt === 1) {
                            let url = `https://hlsdownload.vidbinge.com/?url=${currentSource.url}`;
                            window.open(url, "_blank");
                        }
                        if (item.opt === 2) {
                            let url = `https://mediatools.cc/hlsDownloader?query=${currentSource.url}`;
                            window.open(url, "_blank");
                        }
                        if (item.opt === 3) {
                            navigator?.clipboard?.writeText(currentSource.url);
                            let url = `https://hlsdownloader.thetuhin.com/?text=${currentSource.url}`;
                            window.open(url, "_blank");
                        }
                        if (item.opt === 4) {
                            navigator?.clipboard?.writeText(currentSource.url);
                            let url = `${currentSource.url}`;
                            window.open(url, "_blank");
                        }
                        // Don't return item.html to avoid showing check mark
                        art.notice.show = "Opening download link...";
                    },
                },
            ],
            plugins:
                format === "hls"
                    ? [
                          artplayerPluginHlsQuality({
                              setting: true,
                              getResolution: (level) => level.height + "P",
                              title: "Quality",
                              auto: "Auto",
                          }),
                      ]
                    : [],
        });

        // Store instance reference
        artInstanceRef.current = art;

        if (getInstance && typeof getInstance === "function") {
            getInstance(art);
        }

        return () => {
            if (art && art.destroy) {
                art.destroy(false);
            }
            artInstanceRef.current = null;
        };
    }, [currentSource.url, captions, format, sources, headers]);

    return <div ref={artRef} {...rest} style={{ width: "100%", height: "100%", aspectRatio: "16/9" }}></div>;
}
