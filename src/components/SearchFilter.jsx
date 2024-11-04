import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const SearchFilter = ({ onSearch, onTypeChange, type, initialQuery, showDropdown = true }) => {
    const [query, setQuery] = useState(initialQuery || "");

    useEffect(() => {
        setQuery(initialQuery || "");
    }, [initialQuery]);

    const handleInputChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        onSearch(newQuery);
    };

    const getPlaceholderText = () => {
        switch (type) {
            case "movie":
                return "Search movies...";
            case "tv":
                return "Search TV shows...";
            case "anime":
                return "Search anime...";
            default:
                return "Search...";
        }
    };

    return (
        <div className="w-full mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <div className="w-full relative">
                    <input
                        type="text"
                        className="w-full bg-white/10 rounded-lg py-2 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                        placeholder={getPlaceholderText()}
                        value={query}
                        onChange={handleInputChange}
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {showDropdown && (
                    <select
                        className="bg-gray-700 rounded-lg py-2 px-3 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none"
                        value={type}
                        onChange={(e) => onTypeChange(e.target.value)}
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundPosition: "right 0.5rem center",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "1.5em 1.5em",
                        }}
                    >
                        <option value="movie">Movies</option>
                        <option value="tv">TV Shows</option>
                        <option value="anime">Anime</option>
                    </select>
                )}
            </div>
        </div>
    );
};

export default SearchFilter;
