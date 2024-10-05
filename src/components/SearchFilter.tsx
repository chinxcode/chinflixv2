import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { getGenres, getCountries } from "@/lib/api";

interface FilterOptions {
    genre: string;
    year: string;
    sort_by: string;
    with_origin_country: string;
}

interface SearchFilterProps {
    onSearch: (query: string) => void;
    onFilter: (filters: FilterOptions) => void;
    onTypeChange: (type: "movie" | "tv") => void;
    type: "movie" | "tv";
    initialQuery: string;
    initialFilters: FilterOptions;
}

interface Option {
    id?: string;
    value?: string;
    name?: string;
    label?: string;
    english_name?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch, onFilter, onTypeChange, type, initialQuery, initialFilters }) => {
    const [query, setQuery] = useState(initialQuery || "");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>(initialFilters);
    const [genres, setGenres] = useState<Option[]>([]);
    const [countries, setCountries] = useState<Option[]>([]);

    useEffect(() => {
        const fetchFilterOptions = async () => {
            const genresData = await getGenres(type);
            setGenres(genresData.genres);
            const countriesData = await getCountries();
            setCountries(countriesData);
        };
        fetchFilterOptions();
    }, [type]);

    useEffect(() => {
        setQuery(initialQuery || "");
        setFilters(initialFilters);
    }, [initialQuery, initialFilters]);

    useEffect(() => {
        if (query.length >= 2) {
            onSearch(query);
        }
    }, [query, onSearch]);

    const handleFilterChange = (key: keyof FilterOptions, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    const handleTypeChangeInternal = (newType: "movie" | "tv") => {
        onTypeChange(newType);
    };

    const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
    const sortOptions: Option[] = [
        { value: "popularity.desc", label: "Most Popular" },
        { value: "popularity.asc", label: "Least Popular" },
        { value: "vote_average.desc", label: "Highest Rated" },
        { value: "vote_average.asc", label: "Lowest Rated" },
        { value: "release_date.desc", label: "Latest Release" },
        { value: "release_date.asc", label: "Oldest Release" },
    ];

    return (
        <div className="w-full mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <div className="w-full relative">
                    <input
                        type="text"
                        className="w-full bg-white/10 rounded-full py-2 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                        placeholder={`Search ${type === "movie" ? "movies" : "TV shows"}...`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <div className="flex w-full sm:w-auto justify-between sm:justify-start gap-4">
                    <select
                        className="bg-gray-700 rounded-lg py-2 px-3 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none"
                        value={type}
                        onChange={(e) => handleTypeChangeInternal(e.target.value as "movie" | "tv")}
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundPosition: "right 0.5rem center",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "1.5em 1.5em",
                        }}
                    >
                        <option value="movie">Movies</option>
                        <option value="tv">TV Shows</option>
                    </select>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <AdjustmentsHorizontalIcon className="h-6 w-6 text-white" />
                    </button>
                </div>
            </div>
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 overflow-hidden"
                    >
                        <FilterSelect
                            label="Genre"
                            options={[{ id: "", name: "Any" }, ...genres]}
                            value={filters.genre}
                            onChange={(value) => handleFilterChange("genre", value)}
                        />
                        <FilterSelect
                            label="Year"
                            options={[{ id: "", name: "Any" }, ...years.map((year) => ({ id: year.toString(), name: year.toString() }))]}
                            value={filters.year}
                            onChange={(value) => handleFilterChange("year", value)}
                        />
                        <FilterSelect
                            label="Sort By"
                            options={sortOptions}
                            value={filters.sort_by}
                            onChange={(value) => handleFilterChange("sort_by", value)}
                        />
                        <FilterSelect
                            label="Country"
                            options={[{ english_name: "Any" }, ...countries]}
                            value={filters.with_origin_country}
                            onChange={(value) => handleFilterChange("with_origin_country", value)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface FilterSelectProps {
    label: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ label, options, value, onChange }) => (
    <div className="flex flex-col">
        <label className="text-sm text-gray-400 mb-1">{label}</label>
        <select
            className="bg-gray-700 rounded-lg py-2 px-3 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.3rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
            }}
        >
            {options.map((option) => (
                <option key={option.id || option.value} value={option.id || option.value}>
                    {option.name || option.label || option.english_name}
                </option>
            ))}
        </select>
    </div>
);

export default SearchFilter;
