// src/types.ts
export interface FilterOptions {
    genre: string;
    year: string;
    sort_by: string;
    with_origin_country: string;
    [key: string]: string;
}

export interface ResultItem {
    id: number;
    title?: string;
    name: string;
    poster_path: string;
    vote_average: number;
}
