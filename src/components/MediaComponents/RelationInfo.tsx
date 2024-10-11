// src/components/MediaComponents/RelationInfo.tsx
import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface RelationInfoProps {
    title: string;
    recommendations: {
        link: string;
        image: string;
        title: string;
        rating: number;
    }[];
}

const RelationInfo: React.FC<RelationInfoProps> = ({ title, recommendations }) => {
    return (
        <div className="flex flex-col w-full gap-3 tracking-wide mt-4">
            <div className="w-full text-xl font-medium px-1">{title}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {recommendations.map((item, index) => (
                    <Link key={index} href={item.link} className="group">
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-transform duration-200 transform group-hover:scale-105">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover object-center" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
                                <h3 className="text-white font-semibold text-sm truncate">{item.title}</h3>
                                <div className="flex items-center mt-1">
                                    <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                    <span className="text-white text-xs">{item.rating.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RelationInfo;
