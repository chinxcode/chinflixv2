import { useRef, memo } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

const AnimeRelations = memo(({ relations }) => {
    // Create refs for each scrollable container
    const scrollRefs = {
        sequels: useRef(null),
        prequels: useRef(null),
        sideStories: useRef(null),
        spinOffs: useRef(null),
        adaptations: useRef(null),
        related: useRef(null),
    };

    // Function to scroll a specific relations container
    const scroll = (type, direction) => {
        if (scrollRefs[type]?.current) {
            const scrollAmount = scrollRefs[type].current.clientWidth * 0.5;
            scrollRefs[type].current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    // Helper to get relation title based on type
    const getRelationTitle = (type) => {
        switch (type) {
            case "sequels":
                return "Sequels";
            case "prequels":
                return "Prequels";
            case "sideStories":
                return "Side Stories";
            case "spinOffs":
                return "Spin-offs";
            case "adaptations":
                return "Adaptations";
            case "related":
                return "Related";
            default:
                return "Related";
        }
    };

    // Function to render a specific relation section
    const renderRelationSection = (type) => {
        const items = relations[type] || [];

        if (items.length === 0) return null;

        return (
            <section key={type} className="mt-4 px-4 lg:px-0 relative">
                <div className="w-full flex items-center justify-between mb-3">
                    <h3 className="text-[1.15rem] font-medium px-1">{getRelationTitle(type)}</h3>
                    <div className="flex items-center rounded-xl overflow-hidden justify-center gap-[1px]">
                        <button
                            onClick={() => scroll(type, "left")}
                            className="w-9 h-8 bg-white/10 hover:bg-white/[.13] disabled:bg-white/5 active:bg-white/5 flex items-center smoothie justify-center"
                            aria-label={`Scroll ${type} left`}
                        >
                            <ArrowLeftIcon className="size-[1.1rem]" />
                        </button>
                        <button
                            onClick={() => scroll(type, "right")}
                            className="w-9 h-8 bg-white/10 hover:bg-white/[.13] disabled:bg-white/5 active:bg-white/5 flex items-center smoothie justify-center"
                            aria-label={`Scroll ${type} right`}
                        >
                            <ArrowRightIcon className="size-[1.1rem]" />
                        </button>
                    </div>
                </div>
                <div className="relative">
                    <div ref={scrollRefs[type]} className="flex gap-4 w-full overflow-x-auto scrollbar-hide">
                        {items.map((item, index) => (
                            <div key={index} className="w-[32%] sm:w-[22%] md:w-[19%] lg:w-[15%] xl:w-[12%] !aspect-[1.44/2] !shrink-0">
                                <Link href={`/watch/anime/${item.id}`} className="size-full bubbly">
                                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-transform duration-200 transform group-hover:scale-105">
                                        <Image
                                            src={item.poster_path || "/placeholder-poster.png"}
                                            alt={item.title}
                                            width={200}
                                            height={300}
                                            className="w-full h-full object-cover object-center"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
                                            <h4 className="text-white font-semibold text-sm truncate">{item.title}</h4>
                                            <div className="flex items-center mt-1">
                                                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                                <span className="text-white text-xs">{(item.vote_average || 0).toFixed(1)}</span>
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

    // If no relations, don't render anything
    const hasRelations = Object.values(relations).some((items) => items && items.length > 0);
    if (!hasRelations) return null;

    return (
        <div className="bg-gray-900 rounded-lg p-4">
            <h2 className="text-xl font-medium mb-2">Related Anime</h2>
            <div className="space-y-4">
                {renderRelationSection("sequels")}
                {renderRelationSection("prequels")}
                {renderRelationSection("sideStories")}
                {renderRelationSection("spinOffs")}
                {renderRelationSection("adaptations")}
                {renderRelationSection("related")}
            </div>
        </div>
    );
});

AnimeRelations.displayName = "AnimeRelations";
export default AnimeRelations;
