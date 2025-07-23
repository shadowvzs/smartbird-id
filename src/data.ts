import type { CertificateData } from "./types"

export const user = {
    name: 'Dorte',
    email: '',
}

export const newBirdData: CertificateData = {
    id: '',
    ringId: '',
    photos: [],
    sex: '-',
    color: '',
    mutation: '',
    specie: '',
    country: '',
    parentMRingId: '',
    parentFRingId: '',

    owners: [],
    // prefilled based the current user
    breeder: 'Nagy Imre',
    breederId: 'nihu11',
    status: 'active',
    hatchDate: new Date().toISOString().split('T')[0], // current date in YYYY-MM-DD format
}