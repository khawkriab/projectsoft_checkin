import { Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Layout } from 'components/common/Layout';
import { Member } from 'pages/Member';
import { UserRegister } from 'pages/UserRegister';
import { CreateMonthCalendar } from 'pages/CreateMonthCalendar';
import { Absent } from 'pages/Absent';
import { PrivacyPolicy } from 'pages/PrivacyPolicy';
import { WeeklySchedule } from 'pages/WeeklySchedule';
import HomeLanding from 'pages/HomeLanding';
import Demo from 'pages/Demo';

function RoutesManagement() {
    return (
        <Routes>
            <Route path={`/landing`} element={<HomeLanding />} />
            <Route path={`/demo`} element={<Demo />} />
            <Route element={<Layout />}>
                <Route path='/' element={<Home />} />
                <Route path={`/member`} element={<Member />} />
                <Route path={`/register`} element={<UserRegister />} />
                <Route path={`/create-calendar`} element={<CreateMonthCalendar />} />
                <Route path={`/absent`} element={<Absent />} />
                <Route path={`/privacy`} element={<PrivacyPolicy />} />
                <Route path={`/weekly-schedule`} element={<WeeklySchedule />} />
                <Route path={'*'} element={<div>Page not found</div>} />
            </Route>
        </Routes>
    );
}

export default RoutesManagement;
