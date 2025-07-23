import React from 'react';
import { useSnapshot } from 'valtio';
import { store } from '../store';
import { Input } from '../component/Input';
import { Select } from '../component/Select';
import { Form } from '../component/Form';
import { Icon } from '../assets/icons';
import { Button } from '../component/Button';
import { birdStatuses } from '../data/status';
import { RadioGroup } from '../component/RadioGroup';
import { currencies } from '../data/currencies';

const genderOptions = [
    ['-', 'Unknown'],
    ['m', 'Male'],
    ['f', 'Female'],
] as [string,string][];

export const AddBirdScreen = () => {
    const statuses = React.useMemo(() => birdStatuses.map(x => ([x, x] as [string, string])), []);
    const { uploadImage, birdSave, toggleBirdView, goBack } = store;
    const state = useSnapshot(store.birdData);
    const { countries, maleParent, femaleParent, species, colors, mutations } = store.suggestions;
    const photo = state.photos[0];

    return (
        <article className="flex flex-col h-full justify-between items-center h-full">
            <header className="text-2xl font-bold p-2 w-full">
                <Icon name='left' className='inline-block mx-4 cursor-pointer' onClick={goBack} />
                <span>{ state.$isNew ? 'New bird' : state.ringId || 'No ring id' }</span>
            </header>
            <main className="flex flex-col w-full items-center overflow-y-auto overflow-x-hidden">
                <label htmlFor='camera' className='cursor-pointer'>
                    {photo ? (
                        <div className='p-4 w-full'>
                            <div className='w-full p-4 border border-gray-300 rounded-lg flex items-center justify-center gap-2 bg-white dark:bg-gray-800'>
                                <img src={photo} className='text-gray-400' />
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col items-center justify-center p-2 my-4 w-24 h-24 bg-gray-300 rounded-lg gap-2 border border-gray-400 cursor-pointer'>
                            <Icon name='camera' className='text-gray-400' width={42} height={42} />
                            <span className='text-xs'>Take a photo</span>
                        </div>
                    )}
                    <input type='file' accept='image/*' className='hidden' id="camera" onChange={e => uploadImage(e.target.files)}/>
                </label>
                <Form value={store.birdData}>
                    <Input name='ringId' placeholder='Ring ID' label='Ring ID' />
                    <Select name='sex' options={genderOptions} label='Sex' />
                    <Input name='color' placeholder='Color' label='Color' suggestions={colors} />
                    <Input name='mutation' placeholder='Mutation(s)' label='Mutation(s)' suggestions={mutations} />
                    <Input name='specie' placeholder='Specie' label='Specie' suggestions={species} />
                    <Input name='country' placeholder='Country' label='Country' suggestions={countries} />
                    <Select name='status' options={statuses} label='Status' onChange={(ev => {
                        const value = ev.currentTarget.value;
                        if (value === 'for sale') {
                            store.birdData.statusData = {
                                price: 100,
                                negotiable: 'no',
                                tradeableTo: '',
                                currency: 'EUR',
                                date: new Date().toISOString().split('T')[0],
                                location: 'Sopron',
                                contact: '+36712345678',
                            };
                        } else {
                            store.birdData.statusData = undefined;
                        }
                    })} />
                    {state.status === 'for sale' && (
                        <>
                            <div className='flex gap-2 w-full'>
                                <Input name='statusData.price' type='number' placeholder='Price' label='Price' />
                                <Select name='statusData.currency' options={currencies} label='Currency' />
                            </div>
                            <RadioGroup name='statusData.negotiable' label='Negotiable' options={['yes', 'no']} />
                            <Input name='statusData.tradeableTo' type='text' placeholder='Tradable to this specie' label='Tradable to' />
                            <Input name='statusData.date' type='date' placeholder='Sell Date' label='Sell Date' />
                            <Input name='statusData.location' type='text' placeholder='Location' label='Location' />
                            <Input name='statusData.contact' type='text' placeholder='Phone number or email' label='Contact' />
                        </>
                    )}
                    <Input name='breeder' placeholder='Breeder Name' label='Breeder Name' />
                    <Input name='hatchDate' type='date' placeholder='Hatch Date' label='Hatch Date' />
                    <Input name='parentMRingId' placeholder='Dad Ring Id' label='Dad Ring Id' suggestions={maleParent} />
                    <Input name='parentFRingId' placeholder='Mom Ring Id' label='Mom Ring Id' suggestions={femaleParent} />
                </Form>
            </main>
            <footer className='flex justify-center gap-2 w-full p-4 items-center'>
                <Button
                    disabled={!state.$isValid}
                    onClick={birdSave}
                >
                    Save
                </Button>
                {!state.$isNew && (
                    <>
                        <Button
                            appearance='default'
                            onClick={toggleBirdView}
                        >
                            Preview
                        </Button>
                        <Button
                            appearance='default'
                            onClick={toggleBirdView}
                        >
                            Sell
                        </Button>
                    </>
                )}
            </footer>
        </article>
    )
};
