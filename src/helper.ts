import type { TreeItemData } from "./component/Tree";
import type { CertificateData, SaleStatusData, ScreenState, SearchGrouping } from "./types";

export const fileDataURL = (file: File): Promise<string> => new Promise((resolve,reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
});

export const extractDataViaOCR = (file: File) => {
    const dataSeparatorCharacter = '-';
    const [fileName, dateTime, value, currency] = file.name.split(dataSeparatorCharacter);
    const [year, mounth, day, hour, minute, second] = dateTime.split('_');

    const data = {
        fileName,
        dateTime: new Date(`${year}-${mounth}-${day}T${hour}:${minute}:${second}`),
        fileSize: file.size,
        lastModified: file.lastModified,
        value: value.replace('_', '.'),
        currency: currency.split('.')[0] // Assuming currency is the first part of the last segment
    };

    return data;
}

export const birdSearchGrouping = (birds: CertificateData[], grouping: SearchGrouping) => {
    const groups: Record<string, CertificateData[]> = {};
    const { key } = grouping;
    
    const clonedBirds = [...birds];
    if (key === 'year') {
        clonedBirds.forEach(bird => {
            const year = bird.hatchDate.substring(0, 4);
            if (!groups[year]) {
                groups[year] = [];
            }
            groups[year].push(bird);
        });
    } else if (key === 'specie') {
        clonedBirds.forEach(bird => {
            const specie = bird.specie;
            if (!groups[specie]) {
                groups[specie] = [];
            }
            groups[specie].push(bird);
        });
    } else if (key === 'country') {
        clonedBirds.forEach(bird => {
            const country = bird.country;
            if (!groups[country]) {
                groups[country] = [];
            }
            groups[country].push(bird);
        });
    } else if (key === 'status') {
        clonedBirds.forEach(bird => {
            const status = bird.status;
            if (!groups[status]) {
                groups[status] = [];
            }
            groups[status].push(bird);
        });
    }

    return groups;
};

export const getBirdContactInfo = (bird: CertificateData) => {
    const contact = (bird.statusData as SaleStatusData)?.contact;
    if (contact) {
        const contactInfo = contact.split(/,;/).map((item) => item.trim());
        return  contactInfo.reduce((acc, item) => {
            item = item.replace(/ /g, ''); // remove all whitespace
            if (item.startsWith('phone:') || item.match(/^\+?\d{10,15}$/)) {
                acc.phone = item.replace('phone:', '').trim(); // remove non-digit characters
            } else if (item.startsWith('email:') || item.includes('@')) {
                acc.email = item.replace('email:', '').trim();
            } else if (item.startsWith('social:') || item.includes('https://')) {
                acc.socialMedia = item.replace('social:', '').trim();
            }
            return acc;
        }, { phone: '', email: '', socialMedia: '' });
    }
    return {
        phone: '',
        email: '',
        socialMedia: ''
    };
};

export const getParentPage = (screen: ScreenState) => {
    const { previous } = screen;
    const parentPage = [...previous].reverse().find((page) => page === 'market' || page === 'search');
    return parentPage;
};

const dayInMilliseconds = 1000 * 60 * 60 * 24; // Average day length in milliseconds
const monthInMilliseconds = dayInMilliseconds * 30; // Average month length in milliseconds
const yearInMilliseconds = dayInMilliseconds * 365.25; // Average year length in milliseconds
export const ageCalculator = (dateString: string) => {
    const age = Date.now() - new Date(dateString).getTime();
    if (age < monthInMilliseconds) {
        return `${Math.floor(age / dayInMilliseconds)} days`;
    } else if (age < yearInMilliseconds) {
        return `${Math.floor(age / monthInMilliseconds)} months`;
    } else {
        return `${Math.floor(age / yearInMilliseconds)} years`;
    }
};

export const sexToUnicodeCharacter = {
    'm': '♂',
    'f': '♀',
    '-': '?' // Neutral or unknown
}

const recursiveTreeBuild = (birdId: string, birdValueMap: Map<string, CertificateData>) => {
    const bird = birdValueMap.get(birdId);
    if (!bird) return;

    const treeItem: TreeItemData = {
        id: bird.ringId,
        label: `${bird.ringId} (${sexToUnicodeCharacter[bird.sex]})`,
        description: `${bird.color} ${bird.mutation}`,
    }

    if (!bird.parentMRingId && !bird.parentFRingId) {
        return treeItem; // No parents, return the current item
    }

    treeItem.children = [];
    if (bird.parentMRingId) {
        const children = recursiveTreeBuild(bird.parentMRingId, birdValueMap);
        if (!children) return console.warn(`Parent M ring ID ${bird.parentMRingId} not found for bird ${bird.ringId}`);
        treeItem.children.push(children!);
    }

    if (bird.parentFRingId) {
        const children = recursiveTreeBuild(bird.parentFRingId, birdValueMap);
        if (!children) return console.warn(`Parent F ring ID ${bird.parentFRingId} not found for bird ${bird.ringId}`);
        treeItem.children.push(children!);
    }

    return treeItem;
}

export const buildBirdBloodline = (data: CertificateData, birds: CertificateData[]) => {
    const birdValueMap = new Map<string, CertificateData>();
    birds.forEach(bird => {
        birdValueMap.set(bird.ringId, bird);
    });

    return recursiveTreeBuild(data.ringId, birdValueMap);
}

export const getSuggestionsBasedOnData = (birds: CertificateData[]) => {
    const species = new Set<string>();
    const countries = new Set<string>();
    const colors = new Set<string>();
    const mutations = new Set<string>();
    const statuses = new Set<string>();

    birds.forEach(bird => {
        species.add(bird.specie);
        countries.add(bird.country);
        colors.add(bird.color);
        statuses.add(bird.status);
        if (bird.mutation) {
            mutations.add(bird.mutation);
        }
    });

    const suggestions = {
        species: Array.from(species).sort(),
        countries: Array.from(countries).sort(),
        colors: Array.from(colors).sort(),
        mutations: Array.from(mutations).sort(),
        statuses: Array.from(statuses).sort(),
    };

    return suggestions;
};

export const availableGroupingOptions: [string, string][] = [
    ['none', 'None'],
    ['year', 'Year'],
    ['specie', 'Species'],
    ['country', 'Country'],
    ['status', 'Status'],
];

export const availableGroupingDirection: [string, string][] = [
    ['ASC', 'Ascending'],
    ['DESC', 'Descending'],
];