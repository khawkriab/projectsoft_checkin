import { BrowserRouter } from 'react-router-dom';
import RoutesManagement from './RouteManagement';
import { GoogleLoginProvider } from 'components/common/GoogleLoginProvider';
import './App.css';
import { ThemeProvider } from 'components/common/ThemeProvider';

function App() {
    return (
        <BrowserRouter basename='/projectsoft_checkin'>
            <ThemeProvider>
                <GoogleLoginProvider>
                    <RoutesManagement />
                </GoogleLoginProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
