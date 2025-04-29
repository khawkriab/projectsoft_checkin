import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Checkin } from "./pages/Checkin";
import { Personal } from "./pages/Personal";
import { Schedule } from "./pages/Schedule";
import { Summary } from "./pages/Summary";
import { Layout } from "components/layout";
import { Absent } from "./pages/Absent";
import { Register } from "./pages/Register";

interface RegisterProps {
  fullName: string;
  email: string;
}

function RoutesManagement() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    id: "",
    idToken: "",
  });

  const handleProfileLoad = (profileData: {
    fullName: string;
    email: string;
    id: string;
    idToken: string;
  }) => {
    console.log("Profile received from Layout:", profileData);
    setProfile(profileData);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onProfileLoad={handleProfileLoad} />}>
          <Route path="/Checkin" element={<Checkin />} />
          <Route path="/Personal" element={<Personal />} />
          <Route path="/Schedule" element={<Schedule />} />
          <Route path="/Summary" element={<Summary />} />
          <Route path="/Absent" element={<Absent />} />
          <Route
            path="/Register"
            element={
              <Register
                fullName={profile.fullName}
                email={profile.email}
                id={profile.id}
                idToken={profile.idToken}
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesManagement;
