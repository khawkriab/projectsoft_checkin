import { Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Layout } from 'components/common/Layout';
import { Member } from 'pages/Member';
import { UserRegister } from 'pages/UserRegister';
import { CreateMonthCalendar } from 'pages/CreateMonthCalendar';

function RoutesManagement() {
    const basePath = process.env.NODE_ENV === 'production' ? '/projectsoft_checkin' : '';
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path='/' element={<Home />} />
                <Route path={`${basePath}/member`} element={<Member />} />
                <Route path={`${basePath}/register`} element={<UserRegister />} />
                <Route path={`${basePath}/create-calendar`} element={<CreateMonthCalendar />} />
            </Route>
        </Routes>
    );
}

export default RoutesManagement;
