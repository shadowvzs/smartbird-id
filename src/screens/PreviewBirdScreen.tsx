import { useSnapshot } from 'valtio';
import { store, t } from '../store';
import { Button } from '../component/Button';
import type { CertificateData, SaleStatusData } from '../types';
import { languages } from '../data/languages';
import { Icon } from '../assets/icons';
import { screenStyle } from './style';
import { useMemo } from 'react';
import { Tree } from '../component/Tree';
import { buildBirdBloodline, getBirdContactInfo, getParentPage, sexToUnicodeCharacter } from '../helper';
import { birds } from '../data/birds';
import { socialMedia } from '../data/social-media';

type RenderFunction = <K extends keyof CertificateData>(value: CertificateData[K], data: CertificateData) => React.ReactNode;
interface TemplateItem {
    label: string;
    name: string;
    render?: RenderFunction;
}
const getBirdDataTemplate = (): TemplateItem[] => ([
    { label: t`Ring ID`, name: 'ringId' },
    { label: t`Sex`, name: 'sex', render: (value) => {
        if (!value) return '';
        const sexTr = value === 'f' ? t`Female` : t`Male`;
        const icon = sexToUnicodeCharacter[value as 'f' | 'm'];
        return `${icon} (${sexTr})`;
    }},
    { label: t`Color`, name: 'color' },
    { label: t`Mutation(s)`, name: 'mutation' },
    { label: t`Specie`, name: 'specie' },
    { label: t`Breeder`, name: 'breeder' },
    {
        label: t`Owner`,
        name: 'owners',
        render: ((owners: CertificateData['owners']) => {
            if (!owners || owners.length === 0) {
                return null;
            }
            return owners && owners[owners.length - 1]?.name || '-';
        }) as RenderFunction
    },
    { label: t`Hatch date`, name: 'hatchDate' },
    { label: t`Country`, name: 'country' },
    { label: t`Bloodline`, name: 'id', render: (_value, data) => {
        if (!data.parentMRingId && !data.parentFRingId) return '-';
        const treeItem = buildBirdBloodline(data, birds);
        if (!treeItem) return '-';
        return <Tree root={treeItem} />;
    }},
    { label: t`Status`, name: 'status', render: (value, data) => {
        if (value !== 'for sale') return String(value);
        if (!data.statusData) return 'for sale';
        const saleData: React.ReactNode[] = [];
        const statusData = data.statusData as SaleStatusData;
        if (statusData.price) {
            const neg = statusData.negotiable ? t`yes` : t`no`;
            saleData.push(
                `${t`Price`}: ${statusData.price} ${statusData.currency} (neg: ${neg}); ${statusData.location ?? ''}`);
        }

        if (statusData.tradeableTo) {
            saleData.push(`${t`Trade to`}: ${statusData.tradeableTo}; ${statusData.price ? '' : statusData.location}`);
        }
        if (statusData.location && !statusData.price && !statusData.tradeableTo) {
            saleData.push(`${t`Location`}: ${statusData.location}`);
        }

        if (!statusData.contact) {
            saleData.push(`${t`Added at`}: ${statusData.date}`);
        }

        const { phone } = getBirdContactInfo(data);
        if (phone) {
            saleData.push(
                <div className='w-full text-right'>
                    {phone} - <small>{statusData.date}</small>
                </div>
            );
        }

        return (
            <div className='flex flex-col gap-1 w-full text-right'>
                {saleData.map((item, index) => (
                    <div key={index} className='text-gray-700 w-full'> {item} </div>
                ))}
            </div>
        );
    }},
]);

interface RowRenderProps extends TemplateItem {
    data: CertificateData;
}
const RowRender = ({ label, name, render, data }: RowRenderProps) => {
    const value = data[name as keyof CertificateData];
    const text = render ? render(value, data) : String(value) || '';
    if (!text) return null;
    return (
        <div className="flex justify-between w-full px-8">
            <span className="font-semibold">{label}:</span>
            <span className="text-gray-700">
                {text}
            </span>
        </div>
    );
};

const LanguageSelectOverlay = () => {
    const drawerState = useSnapshot(store.drawer);
    const screenState = useSnapshot(store.screen);
    if (!drawerState.language) return null;
    const currentLanguage = Reflect.get(languages, screenState.language);

    return (
        <div className="absolute inset-0 bg-white/50 p-6 flex items-center" style={{ backdropFilter: 'blur(10px)', borderRadius: screenStyle.borderRadius }}>
            <div className='absolute right-8 top-6 p-4 rounded-lg shadow-lg cursor-pointer' onClick={() => store.drawer.language = false} >
                <Icon name='close' />
            </div>
            <div className='h-88 w-full flex flex-col items-center justify-center gap-8'>
                <div className='flex items-center gap-4 bg-white/50 p-4 rounded-lg w-full justify-between'>
                    <span className="text-lg font-semibold">{t`Selected language`}</span>
                    <img src={currentLanguage.icon} alt={currentLanguage.name} className="w-8 h-6" />
                </div>
                <div className='flex flex-col items-center gap-2 bg-white/50 p-4 rounded-lg'>
                    <span className="text-lg font-semibold">{t`Available languages`}</span>
                    <div className='flex gap-4 items-center flex-wrap justify-center pt-2'>
                        {Object.entries(languages).filter(([key]) => key !== screenState.language).map(([key, lang]) => (
                            <span
                                className='p-4 bg-white/30 rounded-lg cursor-pointer hover:bg-white/90 transition-colors '
                                onClick={() => {
                                    store.screen.language = key;
                                    store.drawer.language = false;
                                }}
                            >
                                <img src={lang.icon} alt={lang.name} className="w-10 h-8" />
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SpecieInformationLayer = () => {
    const drawerState = useSnapshot(store.drawer);
    const birdState = useSnapshot(store.birdData);

    if (!drawerState.specieInfo) return null;

    return (
        <div className="absolute inset-0 bg-white/70 flex items-center" style={{ backdropFilter: 'blur(10px)', borderRadius: screenStyle.borderRadius }}>
            <div className='absolute right-8 top-6 p-4 rounded-lg shadow-lg cursor-pointer' onClick={() => store.drawer.specieInfo = false} >
                <Icon name='close' />
            </div>
            <div className='w-full max-w-md dark:bg-gray-800 p-6 rounded-lg shadow-lg overflow-y-auto' style={{ maxHeight: '80vh' }}>
                <h2 className='text-xl font-bold mb-4'>Base Information <span className='text-blue-900 capitalize'>{birdState.specie}</span></h2>
                <h3 className='text-lg font-bold mb-4'>Definition & Classification</h3>
                <p className='mb-4'>
                    Parrotlets are among the smallest New World parrots, part of the Psittacidae family, and include genera such as Forpus, Nannopsittaca, and Touit. Commonly known as “pocket parrots” or “South American lovebirds,” they resemble larger parrots in behavior despite their diminutive size.
                </p>
                <h3 className='text-lg font-bold mb-4'>Size & Lifespan</h3>
                <p className='mb-4'>
                    Adult parrotlets measure approximately 12-15 cm (4.7-5.9 in) in length and weigh between 23-35 g (0.8-1.2 oz).<br />
                    With proper care, their lifespan ranges from 10 to 20 years, and some individuals can live even longer.
                </p>
                <h3 className='text-lg font-bold mb-4'>Appearance & Color Variants</h3>
                <p className='mb-4'>
                    The wild-type plumage of parrotlets is typically green, but captive-bred varieties exhibit numerous color morphs—including blue, yellow, gray, and various marbled or pied patterns. 
                    For instance, males of some species display vibrant blue markings (e.g., Pacific, Mexican, or spectacled parrotlets), while females remain predominantly green.
                </p>
                <h3 className='text-lg font-bold mb-4'>Behavior & Temperament</h3>
                <p className='mb-4'>
                    Despite their small size, parrotlets are characterized by bold, feisty, and curious personalities. They form strong social bonds, are highly intelligent, and can sometimes learn to mimic a limited vocabulary of 10-15 words.<br />
                    They exhibit aggressive tendencies, particularly toward other birds, and typically form lifelong pair bonds.
                </p>
                <h3 className='text-lg font-bold mb-4'>Diet & Care Requirements</h3>
                <p className='mb-4'>
                    Parrotlets require a nutrient-rich diet that includes high-quality pellets supplemented with fresh fruits, vegetables, and occasional seeds. A calcium source, such as cuttlebone, is essential, especially for breeding females.<br />
                    They are highly active, needing daily stimulation—interaction, toys, and opportunities to fly—to prevent boredom or destructive behavior.
                </p>
                <h3 className='text-lg font-bold mb-4'>Habitat & Social Needs</h3>
                <p className='mb-4'>
                    Native to Central and South America, parrotlets inhabit forest edges, scrublands, and open woodlands. In the wild, they often travel in flocks of 4 to over 100 individuals. In captivity, at least two hours of daily human interaction is important to maintain their well-being.
                </p>
            </div>
        </div>
    );
}

const ShareDrawer = () => {
    const drawerState = useSnapshot(store.drawer);

    return (
        <>
            {drawerState.share && <div className='absolute inset-0' onClick={() => store.drawer.share = false} />}
            <div
                className="absolute left-0 right-0 bottom-0 bg-white/50 p-6 h-40 transition-all duration-300"
                style={{ backdropFilter: 'blur(10px)', transform: drawerState.share ? 'translateY(0)' : 'translateY(100%)' }}
            >
                <div className='text-lg pb-4'>Share with:</div>
                <div className=' flex flex-wrap gap-4 justify-center'>
                    {Object.values(socialMedia).map((media) => (
                        <div
                            key={media.name}
                            className='flex flex-col gap-2 items-center cursor-pointer'
                            onClick={() => {
                                store.drawer.share = false;
                            }}
                        >
                            <img
                                src={media.icon}
                                alt={media.name}
                                className="w-10 h-10"
                            />
                            <span className='text-xs text-center block'>{media.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export const PreviewBirdScreen = () => {
    const { toggleBirdView, goBack } = store;
    const birdState = useSnapshot(store.birdData);
    const screenState = useSnapshot(store.screen);
    const template = useMemo(() => getBirdDataTemplate(), [screenState.language]);
    const photo = birdState.photos[0];
    const currentLanguage = Reflect.get(languages, screenState.language);
    const isSearch = getParentPage(store.screen) === 'search';
    const contactInfo = getBirdContactInfo(store.birdData);

    return (
        <article className="flex flex-col h-full items-center h-full justify-between relative">
            <header className="text-2xl font-bold p-2 w-full">
                <Icon name='left' className='inline-block mx-4 cursor-pointer' onClick={goBack} />
                <span>{birdState.ringId}</span>
            </header>
            <main className="flex flex-col w-full items-center overflow-y-auto">
                <div className='p-8 w-full'>
                    <div className='w-full p-4 border border-gray-300 rounded-lg flex items-center justify-center gap-2 bg-white dark:bg-gray-800'>
                        <img src={photo} className='text-gray-400' />
                    </div>
                </div>
                <div className='pb-4 flex items-center gap-1'>
                    <Icon name='info' className='text-blue-600'/>
                    <span>{t`Learn more about`}</span>
                    <span className='font-bold text-blue-900 cursor-pointer' onClick={() => store.drawer.specieInfo = true}>
                        {birdState.specie}
                    </span>
                </div>
                <div className='w-full'>
                    {template.map((item) => (
                        <RowRender {...item} key={item.name} data={birdState as CertificateData} />
                    ))}
                </div>
                <SpecieInformationLayer />
                <LanguageSelectOverlay />
                <ShareDrawer />
            </main>
            <footer className='flex justify-center gap-2 w-full p-4 items-center'>
                <Button onClick={() => { store.drawer.language = true; }} appearance='default'>
                    <img src={currentLanguage.icon} alt={currentLanguage.name} className="w-8 h-6" />
                </Button>
                {isSearch && (
                    <Button onClick={toggleBirdView}>
                        {t`Edit`}
                    </Button>
                )}
                {!isSearch && contactInfo.phone && (
                    <Button
                        appearance='default'
                    >
                        <a href={`tel:${contactInfo.phone}`}> Call </a>
                    </Button>
                )}
                <Button
                    appearance='default'
                    onClick={() => { store.drawer.share = true; }}
                >
                    {t`Share`}
                </Button>
                {isSearch && (
                    <Button
                        appearance='default'
                        onClick={toggleBirdView}
                    >
                        {t`Print`}
                    </Button>
                )}
            </footer>
        </article>
    )
};
