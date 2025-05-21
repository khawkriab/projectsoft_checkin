import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Layout } from "components/Layout";

function RoutesManagement() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default RoutesManagement;
