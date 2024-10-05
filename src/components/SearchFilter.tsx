import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

interface SearchFilterProps {
    onSearch: (query: string) => void;
    onFilter: (filters: FilterOptions) => void;
}

interface FilterOptions {
    genre: string;
    year: string;
    sortBy: string;
    country: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch, onFilter }) => {
    const [query, setQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        genre: "Any",
        year: "Any",
        sortBy: "Latest Release",
        country: "Any",
    });

    useEffect(() => {
        if (query.length >= 2) {
            onSearch(query);
        }
    }, [query]);

    const handleFilterChange = (key: keyof FilterOptions, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        onFilter({ ...filters, [key]: value });
    };

    return (
        <div className="w-full mb-8">
            <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        className="w-full bg-white/10 rounded-full py-2 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                        placeholder="Search movies, TV shows..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                    <AdjustmentsHorizontalIcon className="h-6 w-6 text-white" />
                </button>
            </div>
            {showFilters && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <FilterSelect
                        label="Genre"
                        options={["Any", "Action", "Comedy", "Drama", "Sci-Fi"]}
                        value={filters.genre}
                        onChange={(value) => handleFilterChange("genre", value)}
                    />
                    <FilterSelect
                        label="Year"
                        options={["Any", "2023", "2022", "2021", "2020"]}
                        value={filters.year}
                        onChange={(value) => handleFilterChange("year", value)}
                    />
                    <FilterSelect
                        label="Sort By"
                        options={["Latest Release", "Popularity", "Rating"]}
                        value={filters.sortBy}
                        onChange={(value) => handleFilterChange("sortBy", value)}
                    />
                    <FilterSelect
                        label="Country"
                        options={["Any", "USA", "UK", "France", "Japan"]}
                        value={filters.country}
                        onChange={(value) => handleFilterChange("country", value)}
                    />
                </div>
            )}
        </div>
    );
};

const FilterSelect = ({ label, options, value, onChange }) => (
    <div className="flex flex-col">
        <label className="text-sm text-gray-400 mb-1">{label}</label>
        <select
            className="bg-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
);

export default SearchFilter;
