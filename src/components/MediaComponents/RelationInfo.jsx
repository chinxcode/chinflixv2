import React, { useRef } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

const RelationInfo = ({ title, recommendations }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.5;
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className="mt-8 px-4 lg:px-0 relative">
            <div className="w-full flex items-center justify-between mb-4">
                <h2 className="text-[1.35rem] font-medium px-1">{title}</h2>
                <div className="flex items-center rounded-xl overflow-hidden justify-center gap-[1px]">
                    <button
                        onClick={() => scroll("left")}
                        className="w-9 h-8 bg-white/10 hover:bg-white/[.13] disabled:bg-white/5 active:bg-white/5 flex items-center smoothie justify-center"
                    >
                        <ArrowLeftIcon className="size-[1.1rem]" />
                        <span className="sr-only">Previous slide</span>
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="w-9 h-8 bg-white/10 hover:bg-white/[.13] disabled:bg-white/5 active:bg-white/5 flex items-center smoothie justify-center"
                    >
                        <ArrowRightIcon className="size-[1.1rem]" />
                        <span className="sr-only">Next slide</span>
                    </button>
                </div>
            </div>
            <div className="relative">
                <div ref={scrollContainerRef} className="flex gap-4 w-full overflow-x-auto scrollbar-hide">
                    {recommendations.map((item, index) => (
                        <div key={index} className="w-[32%] sm:w-[22%] md:w-[19%] lg:w-[15%] xl:w-[12%] !aspect-[1.44/2] !shrink-0">
                            <Link href={item.link} className="size-full bubbly">
                                <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-transform duration-200 transform group-hover:scale-105">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        layout="fill"
                                        objectFit="cover"
                                        className="w-full h-full object-cover object-center"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
                                        <h3 className="text-white font-semibold text-sm truncate">{item.title}</h3>
                                        <div className="flex items-center mt-1">
                                            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                            <span className="text-white text-xs">{item.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RelationInfo;
