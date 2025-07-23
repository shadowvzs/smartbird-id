export const inputStateSetter = <T extends object>(input: HTMLInputElement | HTMLSelectElement, state: T) => {
    const { name, value } = input;

    if (name.includes('.')) {
        const keys = name.split('.');
        let data = Reflect.get(state, keys[0]) ?? {};
        data = { ...data, [keys[1]]: value };
        Reflect.set(state, keys[0], data);
    } else {
        Reflect.set(state, name, value);
    }
};

export const inputValueGetter = <T extends object>(state: T, name: string): string => {
    if (name.includes('.')) {
        const keys = name.split('.');
        const data = Reflect.get(state, keys[0]) ?? {};
        return Reflect.get(data, keys[1]) ?? '';
    }
    return (Reflect.get(state, name) as string) ?? '';
}
