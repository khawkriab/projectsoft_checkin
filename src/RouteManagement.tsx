import { Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Layout } from 'components/common/Layout';
import { Member } from 'pages/Member';
import { UserRegister } from 'pages/UserRegister';
import { CreateMonthCalendar } from 'pages/CreateMonthCalendar';
import { Absent } from 'pages/Absent';

function RoutesManagement() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path='/' element={<Home />} />
                <Route path={`/member`} element={<Member />} />
                <Route path={`/register`} element={<UserRegister />} />
                <Route path={`/create-calendar`} element={<CreateMonthCalendar />} />
                <Route path={`/absent`} element={<Absent />} />
                <Route path={'*'} element={<div>Page not found</div>} />
            </Route>
        </Routes>
    );
}

export default RoutesManagement;
