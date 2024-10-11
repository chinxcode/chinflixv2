import React from "react";

interface CastInfoProps {
    cast: {
        name: string;
        actor: string;
        image: string;
    }[];
}

const CastInfo: React.FC<CastInfoProps> = ({ cast }) => {
    return (
        <div className="flex flex-col">
            <div className="flex flex-col gap-2">
                <div className="text-xl font-medium flex items-center w-full">
                    <span className="text-xl font-medium">Characters</span>
                </div>
                <div className="flex flex-wrap gap-3">
                    {cast.map((character, index) => (
                        <div
                            key={index}
                            title={`${character.name} - ${character.actor}`}
                            className="w-full flex gap-1 h-20 rounded-xl overflow-hidden bg-white/5 hover:bg-white/[.03] smoothie shrink-0"
                        >
                            <div className="h-full flex aspect-square rounded-xl overflow-hidden shrink-0">
                                <img
                                    src={character.image}
                                    alt={character.name}
                                    className="size-full object-cover object-center !select-none shrink-0"
                                />
                            </div>
                            <div className="flex flex-col p-2 py-3">
                                <span className="tracking-wider font-medium text-sm 2xl:text-base text-gray-200 !leading-tight">
                                    {character.name}
                                </span>
                                <span className="tracking-wider text-gray-300 my-auto text-sm !line-clamp-3">{character.actor}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CastInfo;
