import menuScreen from '../assets/phone-screen.jpg';
import appIcon from '../assets/app-icon.png';
import { store } from '../store';

export const PhoneSystemScreen = () => {
    return (
        <article className="flex flex-col justify-between h-full items-center">
            <img src={menuScreen} style={{ width: 422, height: 870, borderRadius: 45 }} />
            <div
                className='absolute text-center cursor-pointer'
                style={{ top: 520, left: 130, borderRadius: 15 }}
                onClick={() => store.goToScreen('home') }
            >
                <img src={appIcon} style={{ width: 56, height: 52, borderRadius: 15 }} />
                <div className='text-white font-sans' style={{ transform: 'translateX(-7px)', fontSize: 12, paddingTop: 3, fontWeight: 500 }}>
                    SmartBird Id
                </div>
            </div>
        </article>
    )
}