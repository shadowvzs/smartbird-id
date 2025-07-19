import { useSnapshot } from 'valtio';
import { store, t } from '../store';
import { Button } from '../component/Button';
import type { CertificateData } from '../types';
import { languages } from '../data/languages';
import { Icon } from '../assets/icons';
import { screenStyle } from './style';
import { useMemo } from 'react';
import { Tree } from '../component/Tree';
import { buildBirdBloodline } from '../helper';
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
        if (value === 'f') return '♀ (female)';
        return '♂ (male)';
    }},
    { label: t`Color`, name: 'color' },
    { label: t`Mutation(s)`, name: 'mutation' },
    { label: t`Specie`, name: 'specie' },
    { label: t`Breeder`, name: 'breeder' },
    { label: t`Status`, name: 'status' },
    {
        label: t`Owner`,
        name: 'owners',
        render: ((owners: CertificateData['owners']) => {
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
    const { toggleBirdView, goToHome } = store;
    const birdState = useSnapshot(store.birdData);
    const screenState = useSnapshot(store.screen);
    const template = useMemo(() => getBirdDataTemplate(), [screenState.language]);
    const photo = birdState.photos[0];
    const currentLanguage = Reflect.get(languages, screenState.language);

    return (
        <article className="flex flex-col h-full items-center h-full justify-between relative">
            <header className="text-2xl font-bold p-2 w-full">
                <Icon name='left' className='inline-block mx-4 cursor-pointer' onClick={goToHome} />
                <span>{birdState.ringId}</span>
            </header>
            <main className="flex flex-col w-full items-center overflow-y-auto">
                <div className='p-8 w-full'>
                    <div className='w-full p-4 border border-gray-300 rounded-lg flex items-center justify-center gap-2 bg-white dark:bg-gray-800'>
                        <img src={photo} className='text-gray-400' />
                    </div>
                </div>
                <div className='w-full'>
                    {template.map((item) => (
                        <RowRender {...item} key={item.name} data={birdState as CertificateData} />
                    ))}
                </div>

                <LanguageSelectOverlay />
                <ShareDrawer />
            </main>
            <footer className='flex justify-center gap-2 w-full p-4 items-center'>
                <Button onClick={() => { store.drawer.language = true; }} appearance='default'>
                    <img src={currentLanguage.icon} alt={currentLanguage.name} className="w-8 h-6" />
                </Button>
                <Button onClick={toggleBirdView}>
                    {t`Edit`}
                </Button>
                <Button
                    appearance='default'
                    onClick={() => { store.drawer.share = true; }}
                >
                    {t`Share`}
                </Button>
                <Button
                    appearance='default'
                    onClick={toggleBirdView}
                >
                    {t`Print`}
                </Button>
            </footer>
        </article>
    )
};
