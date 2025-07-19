import { ToastContainer } from 'react-toastify'
import mobileFrame from './assets/mobile-frame.png'
import { ScreenComponent } from './screens'
import './App.css'

function App() {
  return (
    <div className="relative flex flex-col">
        <img src={mobileFrame} alt="logo" className="absolute" style={{ width: 984, height:984,  minWidth: 984, minHeight:984, left: -200 }} />
        <ScreenComponent />
        <ToastContainer />
    </div>
  )
}

export default App;
