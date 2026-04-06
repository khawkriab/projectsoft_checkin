import { HashRouter } from 'react-router-dom';
import RoutesManagement from './RouteManagement';
import { ThemeProvider } from 'context/ThemeProvider';
import { FirebaseProvider } from 'context/FirebaseProvider';
import './App.css';
import NotificationCenterProvider from 'components/common/NotificationCenter/NotificationCenterProvider';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import dayjs from 'dayjs';

dayjs.extend(buddhistEra);

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
