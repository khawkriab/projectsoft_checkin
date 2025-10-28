import { Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Layout, UserLayout } from 'components/common/Layout';
import { Member } from 'pages/Member';
import { UserRegister } from 'pages/UserRegister';
import { CreateMonthCalendar } from 'pages/CreateMonthCalendar';
import { LeaveRequest } from 'pages/LeaveRequest';
import { PrivacyPolicy } from 'pages/PrivacyPolicy';
import { WeeklySchedule } from 'pages/WeeklySchedule';
import HomeLanding from 'pages/HomeLanding';
import Demo from 'pages/Demo';
import SystemConfig from 'pages/SystemConfig';

function RoutesManagement() {
    return (
        <Routes>
            <Route element={<UserLayout />}>
                <Route path={`/`} element={<HomeLanding />} />
            </Route>
            <Route path='/manage' element={<Layout />}>
                <Route index element={<Home />} />
                <Route path='/manage/user-checkin' element={<Home />} />
                <Route path={`/manage/member`} element={<Member />} />
                <Route path={`/manage/register`} element={<UserRegister />} />
                <Route path={`/manage/create-calendar`} element={<CreateMonthCalendar />} />
                <Route path={`/manage/leave-request`} element={<LeaveRequest />} />
                <Route path={`/manage/weekly-schedule`} element={<WeeklySchedule />} />
                <Route path={`/manage/system-config`} element={<SystemConfig />} />
            </Route>
            <Route path={`/demo`} element={<Demo />} />
            <Route path={`/privacy`} element={<PrivacyPolicy />} />
            <Route path={'*'} element={<div>Page not found</div>} />
        </Routes>
    );
}

export default RoutesManagement;
