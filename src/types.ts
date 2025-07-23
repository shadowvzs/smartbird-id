import type { Routes } from "./screens";

export type BirdStatus = 'escaped' | 'died' | 'active' | 'retired' | 'for sale';
export type SearchGroupingKey = 'year' | 'specie' | 'country'|  'status' | 'none';

export interface OwnerData {
    id: string;
    name: string;
    date: string; // date of selling the bird
}

interface BaseStatusData {
    date: string; // date when the status was set
}

export interface SaleStatusData extends BaseStatusData {
    price: number; // price of the bird if for sale
    currency: string;
    negotiable: string; // if the price is negotiable: "yes" or "no"
    tradeableTo: string; // if the bird is tradeable, to which specie
    location: string; // location of the bird
    contact: string; // contact information for the sale: phone, email, etc.
}

type StatusData = SaleStatusData | BaseStatusData;

export interface CertificateData {
    id: string; // db id
    $isNew?: boolean; // if true, this is a new bird that has not been saved yet
    $isValid?: boolean; // if true, this bird has been saved
    ringId: string;
    photos: string[];
    sex: 'm' | 'f' | '-',
    color: string;
    mutation: string;
    specie: string;
    country: string;

    owners: OwnerData[]; // owner name
    breeder?: string; // breeder name
    breederId?: string; // breeder id
    status: BirdStatus; // active or inactive bird
    statusData?: StatusData; // additional status data if needed
    hatchDate: string; // date when the bird was hatched

    parentMRingId?: string;
    parentFRingId?: string;
}

export interface ScreenState {
    current: Routes;
    previous: Routes[];
    language: string; // e.g. 'en', 'ro', 'fr'
}

interface Suggestions {
    countries: string[];
    species: string[];
    maleParent: string[];
    femaleParent: string[];
    colors: string[];
    mutations: string[];
}

interface DrawerState {
    language: boolean,
    share: boolean,
    print: boolean,
    filter: boolean,
    specieInfo: boolean,
}

export interface SearchGrouping {
    key: SearchGroupingKey;
    dir: 'ASC' | 'DESC';
}

export interface Store {
    drawer: DrawerState;
    screen: ScreenState;
    birdData: CertificateData;
    suggestions: Suggestions;
    search: {
        text: string;
        results: CertificateData[];
        filter: Record<string, string>;
        grouping: SearchGrouping;
    },
    market: {
        text: string;
        results: CertificateData[];
        filter: Record<string, string>;
        grouping: SearchGrouping;
    },
    birdSave: () => void;
    createSuggestions: () => void;
    goToScreen: (screen: Store['screen']['current']) => void;
    goBack: () => void;
    goToAddNewBird: () => void;
    goToHome: () => void;
    goToSearch: () => void;
    goToMarket: () => void;
    goToSettings: () => void;
    goToQuit: () => void;
    searchBirds: () => void;
    openSearchResult: (bird: CertificateData) => void;
    toggleBirdView: () => void;
    uploadImage: (files: FileList | null) => Promise<void>;
}
