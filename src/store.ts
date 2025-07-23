import { proxy, subscribe } from "valtio";
import type { CertificateData, SaleStatusData, Store } from "./types";
import { newBirdData } from "./data";
import { countryList } from "./data/country";
import { species } from "./data/species";
import { birds } from "./data/birds";
import { mutations } from "./data/mutations";
import { colors } from "./data/colors";
import { fileDataURL, getParentPage } from "./helper";
import { translations } from "./data/translation";

export const store: Store = {
    screen: proxy({
        current: 'home',
        previous: ['system'],
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
    market: proxy({
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
        specieInfo: false,
    }),
    goToScreen: (screen: Store['screen']['current']) => {
        if (store.screen.current === screen) { return; } // no need to change screen if it's already the same
        store.screen.previous.push(store.screen.current);
        store.screen.current = screen;
    },
    goBack: () => {
        if (store.screen.previous.length === 0) { return; } // no previous screen
        store.screen.current = store.screen.previous.pop() as Store['screen']['current'];
        if (store.screen.previous.length === 0) {
            store.screen.previous.push('system'); // always keep 'system' as the last previous screen
        }
    },
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
        store.goToScreen('newBird');
        Object.assign(store.birdData, { 
            ...newBirdData,
            $isNew: true,
            $isValid: false,
            country: 'Romania', // normally this would be setted by the user or from the device location
        });
    },
    toggleBirdView: () => {
        store.goToScreen(store.screen.current === 'previewBird' ? 'newBird' : 'previewBird');
    },
    goToHome: () => {
        store.goToScreen('home');
    },
    goToSearch: () => {
        store.search.text = '';
        store.goToScreen('search');
        store.search.results = birds;
        store.search.filter = {};
        store.search.grouping = {
            key: 'none',
            dir: 'ASC',
        };
    },
    goToMarket: () => {
        store.market.results = birds.filter(bird => bird.status === 'for sale');
        store.market.filter = {};
        store.market.grouping = {
            key: 'none',
            dir: 'ASC',
        };
        store.goToScreen('market');
    },
    goToSettings: () => {
        store.goToScreen('settings');
    },
    goToQuit: () => {
        store.goToScreen('system');
    },
    openSearchResult: (bird: CertificateData) => {
        Object.entries({ ...bird, $isNew: false, $isValid: true })
            .forEach(([key, value]) => {
                Reflect.set(store.birdData, key, value);
            });
        store.goToScreen('previewBird');
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
            Object.entries(data).forEach(([key, value]) => {
                Reflect.set(birds[birdIndex], key, value);
            });
            store.birdData.$isNew = false;
        } else {
            birds.push(data);
            store.birdData.$isNew = false;
        }
        store.goToScreen('previewBird');
    },
    searchBirds: () => {
        let results = [...birds];
        const currentScreen = store.screen.current as 'market' | 'search';
        const parent = store[currentScreen];
        if (parent.text) {
            results = birds.filter(bird => {
                const searchText = parent.text.toLowerCase();
                return bird.ringId.toLowerCase().includes(searchText) ||
                    bird.specie.toLowerCase().includes(searchText) ||
                    bird.country.toLowerCase().includes(searchText) ||
                    bird.status.toLowerCase().includes(searchText);
            });
        }
        if (Object.keys(parent.filter).length > 0) {
            results = results.filter(bird => {
                return Object.entries(parent.filter).every(([key, value]) => {
                    if (!value) return true; // skip empty filters
                    const statusData = bird.statusData as SaleStatusData;
                    if (key === 'minPrice') {
                        return statusData && statusData.price >= Number(value);
                    } else if (key === 'maxPrice') {
                        return statusData && statusData.price <= Number(value);
                    }
                    return String(bird[key as keyof CertificateData]).toLowerCase().includes(value.toLowerCase());
                });
            });
        }
        parent.results = results;
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
