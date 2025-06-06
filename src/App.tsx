import { HashRouter } from 'react-router-dom';
import RoutesManagement from './RouteManagement';
import { ThemeProvider } from 'components/common/ThemeProvider';
import { FirebaseProvider } from 'components/common/FirebaseProvider';
import './App.css';

function App() {
    return (
        <HashRouter>
            {/* <HashRouter basename='/projectsoft_checkin'> */}
            <ThemeProvider>
                <FirebaseProvider>
                    <RoutesManagement />
                </FirebaseProvider>
            </ThemeProvider>
        </HashRouter>
    );
}

export default App;
