import { useSnapshot } from "valtio"
import { store } from "../store"
import { HomeScreen } from "./HomeScreen"
import { PhoneSystemScreen } from "./PhoneSystemScreen";
import { AddBirdScreen } from "./AddBirdScreen";
import { PreviewBirdScreen } from "./PreviewBirdScreen";
import { SearchScreen } from "./SearchScreen";
import { screenStyle } from "./style";
import { MarketScreen } from "./MarketScreen";

const screenMap = {
    system: PhoneSystemScreen,
    home: HomeScreen,
    search: SearchScreen,
    market: MarketScreen,
    newBird: AddBirdScreen,
    previewBird: PreviewBirdScreen,
    settings: HomeScreen,
} as const;

export type Routes = keyof typeof screenMap;

export const ScreenComponent = () => {
    const state = useSnapshot(store.screen)
    const Cmp = screenMap[state.current];
    
    return (
        <div className="absolute bg-red-500 overflow-hidden" style={screenStyle}>
            <Cmp />
        </div>
    )
}