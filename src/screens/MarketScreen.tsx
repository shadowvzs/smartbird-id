import { useSnapshot } from 'valtio';
import { store } from '../store';
import { Button } from '../component/Button';
import { Input } from '../component/Input';
import { Form } from '../component/Form';
import type { CertificateData, SaleStatusData } from '../types';
import { ageCalculator, availableGroupingDirection, availableGroupingOptions, birdSearchGrouping, getSuggestionsBasedOnData, sexToUnicodeCharacter } from '../helper';
import { birds } from '../data/birds';
import { Select } from '../component/Select';
import { Icon } from '../assets/icons';
import { Label } from '../component/Label';

interface SearchItemProps {
    data: CertificateData;
}
const SearchItem = ({ data }: SearchItemProps) => {
    const image = data.photos[0];
    const { price, currency, location, negotiable } = data.statusData as SaleStatusData;
    const age = ageCalculator(data.hatchDate);
    return (
        <div className='inline-block m-2 text-center cursor-pointer' onClick={() => store.openSearchResult(data)}>
            {image && (
                <figure className="mb-2 p-1 border border-gray-300 rounded-lg flex items-center justify-center gap-2 bg-white dark:bg-gray-800 w-18 h-18 mx-auto">
                    <img src={data.photos[0]} alt={data.ringId} className="w-16 h-16 object-fill rounded" />
                </figure>
            )}
            <div className="text-xs font-semibold">{price} {negotiable === 'yes' ? '(neg)' : ''} {currency} - {sexToUnicodeCharacter[data.sex]}</div>
            {location && (<div className="text-xs text-gray-500">{location} - {data.country}</div>)}
            <div className="text-xs text-gray-500 truncate">{data.specie} - {age}</div>
        </div>
    );
};

const SearchResults = () => {
    const market = useSnapshot(store.market);
    console.log('Market results', market.results);
    if (!market.results || market.results.length === 0) {
        return <div className="text-center text-gray-500 w-full">No results found</div>;
    }

    if (market.results.length > 100) {
        return <div className="text-center text-gray-500">Too many results, please refine your search</div>;
    }

    const results = (market.results || [] ) as CertificateData[];
    if (market.grouping.key === 'none') {
        return (
            <div>
                {results.map((bird: CertificateData) => (
                    <SearchItem key={bird.ringId} data={bird} />
                ))}
            </div>            
        );
    }

    const groups = birdSearchGrouping(results, market.grouping);
    const enties = Object.entries(groups);
    if (market.grouping.dir === 'DESC') {
        enties.reverse();
    }

    return (
        <div className="flex flex-col w-full">
            {enties.map(([key, birds]) => (
                <div key={key} className="mb-4">
                    <h3 className="text-md font-semibold mb-2 capitalize">{key}</h3>
                    <hr />
                    <div>
                        {birds.map((bird: CertificateData) => (
                            <SearchItem key={bird.ringId} data={bird} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const FilterDrawer = () => {
    const drawerState = useSnapshot(store.drawer);
    const { species, countries, statuses, colors, mutations } = getSuggestionsBasedOnData(birds);
    return (
        <>
            {drawerState.filter && <div className='absolute inset-0' onClick={() => store.drawer.filter = false} />}
            <div
                className="absolute top-0 right-0 bottom-0 bg-white/50 p-6 flex flex-col justify-between w-xs transition-all duration-700"
                style={{ backdropFilter: 'blur(10px)', transform: drawerState.filter ? 'translateX(0)' : 'translateX(100%)' }}
            >
                <div className='absolute right-8 top-2 p-2 rounded-lg shadow-lg cursor-pointer' onClick={() => store.drawer.filter = false} >
                    <Icon name='close' />
                </div>
                <div className="w-full">
                    <h2 className="text-lg font-semibold mb-4">Filter</h2>
                    <Form value={store.market.filter} className='flex-col gap-4' onSend={store.searchBirds}>
                        {
                            <div className='flex items-center gap-2'>
                                <Label className='text-nowrap'> Price range</Label>
                                <Input name='minPrice' placeholder='Min' />-
                                <Input name='maxPrice' placeholder='Max' />
                            </div>
                        }
                        <Input name='specie' placeholder='Specie' suggestions={species} label={'Specie'} />
                        <Input name='country' placeholder='Country' suggestions={countries} label={'Country'} />
                        <Input name='status' placeholder='Status' suggestions={statuses} label={'Status'} />
                        <Input name='color' placeholder='Color' suggestions={colors} label={'Color'} />
                        <Input name='mutation' placeholder='Mutation(s)' suggestions={mutations} label={'Mutation(s)'} />
                        <div className='text-center'>
                            <Button type='submit' onClick={store.searchBirds}>Apply</Button>
                        </div>
                    </Form>
                </div>

                <div className="w-full">
                    <h2 className="text-lg font-semibold mb-4">Group</h2>
                    <Form value={store.market.grouping} className='flex-col gap-4' onSend={store.searchBirds}>
                        <Select name='key' label={'Group by'} options={availableGroupingOptions} />
                        <Select name='dir' label={'Direction'} options={availableGroupingDirection} />
                        <div className='text-center'>
                            <Button type='submit' onClick={store.searchBirds}>Apply</Button>
                        </div>
                    </Form>
                </div>

            </div>
        </>
    );
};

export const MarketScreen = () => {
    return (
        <article className="flex flex-col h-full items-center h-full">
            <header className="text-2xl font-bold p-2 flex items-center w-full pt-4">
                <Icon name='left' className='inline-block mx-4 cursor-pointer' onClick={store.goBack} />
                <Form value={store.market} className='flex-row gap-2 no-wrap items-center' onSend={store.searchBirds}>
                    <Input name='text' placeholder='Search' endIcon='search' onClick={store.searchBirds}/>
                    <div>
                        <Button type='button' onClick={() => { store.drawer.filter = true }} appearance='default'>
                            filter
                        </Button>
                    </div>
                </Form>
            </header>
            <main className="flex w-full items-center overflow-y-auto p-2">
                <SearchResults />
                <FilterDrawer />
            </main>
            <footer className='flex justify-center gap-2 w-full p-4 items-center'>
            </footer>
        </article>
    )
};
