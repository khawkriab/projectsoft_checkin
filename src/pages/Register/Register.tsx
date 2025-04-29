import React, { useState } from "react";
import {
  TextField,
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Grid,
} from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";

interface RegisterProps {
  fullName: string;
  email: string;
  id: string;
  idToken: string;
}

function Register({ fullName, email, id, idToken }: RegisterProps) {
  const [objDataUser, setObjDataUser] = useState("");
  const [jobPosition, setJobposition] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userType, setUserType] = useState({});

  const handleChange = (event: SelectChangeEvent) => {
    setJobposition(event.target.value as string);
  };

  const handleUserTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserType(event.target.value);
  };

  const handleSubmit = async () => {
    const formData = {
      userId: id,
      userName: userName,
      userEmail: email,
      phoneNumber: phoneNumber,
      userFullName: fullName,
      jobPosition: jobPosition,
      jobStatus: userType,
      userIdToken: idToken,
    };

    console.log("formData:", formData);

    try {
      const response = await fetch("http://192.168.31.165:8000/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // 👇 ดึงข้อความจาก response body (ถ้ามี)
        const errorText = await response.text();
        throw new Error(`Code: ${response.status} - Message: ${errorText}`);
      }

      const result = await response.json();
      console.log("sent success:", result);
      alert("register compleate!");
    } catch (error) {
      if (error instanceof Error) {
        console.error("error:", error.message);
        alert("error:\n" + error.message);
      } else {
        console.error("unknow error:", error);
        alert("unknow error");
      }
    }
  };

  return (
    <Box
      //Blue
      sx={{
        display: "flex",
        width: "100%",
        //border: 1,
        //borderColor: "#1300ff",
        justifyContent: "center",
      }}
    >
      <Box
        //cyan
        sx={{
          width: "100%",
          maxWidth: 900,
          //border: 1,
          //borderColor: "#00f0ff",
        }}
      >
        <Box marginBottom={3}>
          <Divider
            textAlign="left"
            sx={{
              color: "#144ad0",
              fontSize: { xs: 20, md: 28 },
              width: "100%",
            }}
          >
            Register
          </Divider>
        </Box>
        <Box
          sx={{
            width: "100%",
            border: 1,
            borderColor: "#4b4b4b",
            padding: 4,
            borderRadius: 2,
          }}
        >
          <Box
            //red
            sx={{
              width: "100%",
              //border: 1,
              //borderColor: "#ff0000",
            }}
          >
            <Grid container rowSpacing={4} columnSpacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  disabled
                  value={fullName}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  disabled
                  value={email}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="User Name"
                  variant="outlined"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ flexGrow: 1, minWidth: 120 }}>
                  <InputLabel id="job-position-label">Job Position</InputLabel>
                  <Select
                    labelId="job-position-label"
                    id="job-position"
                    value={jobPosition}
                    label="Job Position"
                    onChange={handleChange}
                  >
                    <MenuItem value={"Front-End"}>Front-End</MenuItem>
                    <MenuItem value={"Back-End"}>Back-End</MenuItem>
                    <MenuItem value={"UI Designer"}>UI Designer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <RadioGroup
                  row
                  value={userType}
                  onChange={handleUserTypeChange}
                  sx={{ ml: 2 }}
                >
                  <FormControlLabel
                    value="Company Employee"
                    control={<Radio />}
                    label="Company employee"
                  />
                  <FormControlLabel
                    value="Intern"
                    control={<Radio />}
                    label="Intern"
                  />
                </RadioGroup>
              </Grid>
            </Grid>
          </Box>
          <Box
            sx={{
              width: "100%",
              //border: 1,
              //borderColor: "#00ff00",
              textAlign: "right",
              paddingTop: 6,
            }}
          >
            <Button
              variant="contained"
              sx={{ borderRadius: 10, px: 5, backgroundColor: "#144AAD" }}
              onClick={handleSubmit}
              disabled={
                !userName.trim() ||
                !phoneNumber.trim() ||
                !jobPosition || // age คือ job position ที่เลือกไว้
                !userType
              }
            >
              Register
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Register;
