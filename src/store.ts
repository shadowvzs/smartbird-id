import { proxy, subscribe } from "valtio";
import type { CertificateData, Store } from "./types";
import { newBirdData } from "./data";
import { countryList } from "./data/country";
import { species } from "./data/species";
import { birds } from "./data/birds";
import { mutations } from "./data/mutations";
import { colors } from "./data/colors";
import { fileDataURL } from "./helper";
import { translations } from "./data/translation";

export const store: Store = {
    screen: proxy({
        current: 'home',
        language: 'en',
    }),
    search: proxy({
        text: '',
        results: [],
        filter: {},
        grouping: {
            key: 'none',
            dir: 'ASC',
        }
    }),
    birdData: proxy({ ...newBirdData }),
    suggestions: {
        countries: [],
        species: [],
        maleParent: [],
        femaleParent: [],
        colors,
        mutations,
    },
    drawer: proxy({
        language: false,
        share: false,
        print: false,
        filter: false,
    }),
    createSuggestions: () => {
        // normally this would be fetched from an API and only 1x
        store.suggestions.countries = countryList.map(country => country.name);
        store.suggestions.species = species.map(specie => specie.english);
        // those can be setted more dynamically
        store.suggestions.maleParent = birds.filter(bird => bird.sex === 'm' || bird.sex === '-').map(bird => bird.ringId);
        store.suggestions.femaleParent = birds.filter(bird => bird.sex === 'f' || bird.sex === '-').map(bird => bird.ringId);
    },
    goToAddNewBird: () => {
        store.createSuggestions();
        store.screen.current = 'newBird';
        Object.assign(store.birdData, { 
            ...newBirdData,
            $isNew: true,
            $isValid: false,
            country: 'Romania', // normally this would be setted by the user or from the device location
        });
    },
    toggleBirdView: () => {
        store.screen.current = store.screen.current === 'previewBird' ? 'newBird' : 'previewBird';
    },
    goToHome: () => {
        store.screen.current = 'home';
    },
    goToSearch: () => {
        store.search.text = '';
        store.screen.current = 'search';
        store.search.results = birds;
        store.search.filter = {};
        store.search.grouping = {
            key: 'none',
            dir: 'ASC',
        };
    },
    goToSettings: () => {
        store.screen.current = 'settings';
    },
    goToQuit: () => {
        store.screen.current = 'system';
    },
    openSearchResult: (bird: CertificateData) => {
        Object.entries({ ...bird, $isNew: false, $isValid: true })
            .forEach(([key, value]) => {
                Reflect.set(store.birdData, key, value);
             });
        // store.birdData = proxy({ ...bird, $isNew: false, $isValid: true });
        store.screen.current = 'previewBird';
    },
    uploadImage: async (files: FileList | null) => {
        if (!files || !files[0]) { return; }
        const imageAsString = await fileDataURL(files[0]);
        store.birdData.photos = [imageAsString, ...store.birdData.photos];        
        if (files[0].name === "pionus.jpg") {
            store.birdData.sex = 'm'; // for testing purposes, setting a default value
            store.birdData.specie = 'bronze-winged';
            store.birdData.color = 'Bronze';
            store.birdData.mutation = '';
            store.birdData.ringId = 'HU25NI123';
            store.birdData.country = 'HU';
            store.birdData.status = 'active';
        }
    },
    birdSave: () => {
        const birdIndex = birds.findIndex(bird => bird.ringId === store.birdData.ringId);
        const data = { ...store.birdData };
        if (birdIndex !== -1) {
            birds[birdIndex] = data;
        } else {
            birds.push(data);
            store.birdData.$isNew = false;
        }
        store.screen.current = 'previewBird';
    },
    searchBirds: () => {
        let results = [...birds];

        if (store.search.text) {
            results = birds.filter(bird => {
                const searchText = store.search.text.toLowerCase();
                return bird.ringId.toLowerCase().includes(searchText) ||
                    bird.specie.toLowerCase().includes(searchText) ||
                    bird.country.toLowerCase().includes(searchText) ||
                    bird.status.toLowerCase().includes(searchText);
            });
        }
        if (Object.keys(store.search.filter).length > 0) {
            results = results.filter(bird => {
                return Object.entries(store.search.filter).every(([key, value]) => {
                    if (!value) return true; // skip empty filters
                    return String(bird[key as keyof CertificateData]).toLowerCase().includes(value.toLowerCase());
                });
            });
        }
        store.search.results = results;
        console.log('Search results:', results.length, 'found for text:', store.search);
    }
};

subscribe(store.birdData, () => {
    store.birdData.$isValid = Boolean(store.birdData.ringId && store.birdData.specie);
});

// translation helper
export const t = (templateStringsArray: TemplateStringsArray) => {
    const id = templateStringsArray.raw.join('');
    const { language } = store.screen;
    const text = translations[language]?.[id];
    if (!text) {
        console.warn(`Translation for language "${language}:${id}" not found.`);
        return id; // Fallback to the original string if translation is not available
    }
    return text;
}
