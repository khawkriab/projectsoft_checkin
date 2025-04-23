import { NavLink, Outlet } from "react-router-dom"; // ใช้ 'react-router-dom' นะ

function Layout() {
  return (
    <div>
      <nav className="navbar">
        <ul className="nav-ul">
          <li className="nav-li">
            <NavLink to="/Checkin">Checkin</NavLink>
          </li>
          <li className="nav-li">
            <NavLink to="/Personal">Personal</NavLink>
          </li>
          <li className="nav-li">
            <NavLink to="/Schedule">Schedule</NavLink>
          </li>
          <li className="nav-li">
            <NavLink to="/Summary">Summary</NavLink>
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
}

export default Layout;
