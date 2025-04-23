import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Checkin } from "./pages/Checkin";
import { Personal } from "./pages/Personal";
import { Schedule } from "./pages/Schedule";
import { Summary } from "./pages/Summary";
import { Layout } from "components/layout";

function RoutesManagement() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Checkin />} />
          <Route path="/Personal" element={<Personal />} />
          <Route path="/Schedule" element={<Schedule />} />
          <Route path="/Summary" element={<Summary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesManagement;
