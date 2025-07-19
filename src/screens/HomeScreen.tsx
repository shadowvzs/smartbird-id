import { IconButton } from '../assets/icons';
import { store } from '../store';

export const HomeScreen = () => {
    const { goToAddNewBird, goToSearch, goToSettings, goToQuit } = store;
    return (
        <article className="flex flex-col justify-between h-full items-center">
            <header className="text-2xl font-bold p-2"> SmartBird ID </header>
            <nav className="w-48 flex flex-col gap-4 text-2xl">
                <IconButton text='Add bird' name='addDocument' onClick={goToAddNewBird} />
                <IconButton text='Search' name='search' onClick={goToSearch} />
                <IconButton text='Settings' name='settings' onClick={goToSettings} />
                <IconButton text='Quit' name='quit' onClick={goToQuit} />
            </nav>
            <footer>

            </footer>
        </article>
    )
};