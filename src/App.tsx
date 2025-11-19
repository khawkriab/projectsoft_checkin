import { HashRouter } from 'react-router-dom';
import RoutesManagement from './RouteManagement';
import { ThemeProvider } from 'context/ThemeProvider';
import { FirebaseProvider } from 'context/FirebaseProvider';
import './App.css';
import NotificationCenterProvider from 'components/common/NotificationCenter/NotificationCenterProvider';

function App() {
    return (
        <HashRouter>
            {/* <HashRouter basename='/projectsoft_checkin'> */}
            <ThemeProvider>
                <NotificationCenterProvider>
                    <FirebaseProvider>
                        <RoutesManagement />
                    </FirebaseProvider>
                </NotificationCenterProvider>
            </ThemeProvider>
        </HashRouter>
    );
}

export default App;
