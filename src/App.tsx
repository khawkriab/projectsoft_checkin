import { BrowserRouter } from "react-router-dom";
import "./App.css";
import RoutesManagement from "./RouteManagement";

function App() {
  return (
    <BrowserRouter basename="/projectsoft_checkin">
      <RoutesManagement />;
    </BrowserRouter>
  );
}

export default App;
