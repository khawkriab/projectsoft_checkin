import { Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Layout } from 'components/Layout';
import { Member } from 'pages/Member';
import { UserRegister } from 'pages/UserRegister';
import { AddUser, UserList } from 'components/UserLIst';

function RoutesManagement() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path='/' element={<Home />} />
                <Route path='/member' element={<Member />} />
                <Route path='/register' element={<UserRegister />} />
                <Route path='/add-user' element={<AddUser />} />
                <Route path='/user-list' element={<UserList />} />
            </Route>
        </Routes>
    );
}

export default RoutesManagement;
