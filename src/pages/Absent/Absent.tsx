import React, { useState } from "react";
import {
  Box,
  Divider,
  Grid,
  Button,
  TextField,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import UploadIcon from "@mui/icons-material/Upload";

function Absent() {
  const [sdate, setsDate] = useState<Dayjs | null>(dayjs());
  const [edate, seteDate] = useState<Dayjs | null>(dayjs());
  const [leaveType, setLeaveType] = useState("ลาพัก");
  const [reason, setReason] = useState("");
  const [fileName, setFileName] = useState("");

  const handleLeaveTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newLeaveType: string
  ) => {
    if (newLeaveType !== null) {
      console.log("เลือกประเภทการลา:", newLeaveType);
      setLeaveType(newLeaveType);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <Box
      //L1
      sx={{
        display: "flex",
        width: "100%",
        //border: 1,
        //borderColor: "#1300ff",
        justifyContent: "center",
      }}
    >
      <Box
        //L2
        sx={{
          width: "100%",
          maxWidth: 900,
          //border: 1,
          //borderColor: "#00f0ff",
        }}
      >
        <Box
          //L3
          marginBottom={3}
        >
          <Divider
            textAlign="left"
            sx={{
              color: "#144ad0",
              fontSize: { xs: 20, md: 28 },
              width: "100%",
            }}
          >
            Absent
          </Divider>
        </Box>
        <Box
          //L4
          sx={{
            width: "100%",
            border: 1,
            borderColor: "#4b4b4b",
            padding: 4,
            borderRadius: 2,
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container rowSpacing={4} columnSpacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="วันเริ่มลา"
                  value={sdate}
                  onChange={(newValue) => setsDate(newValue)}
                  format="MM/DD/YYYY"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="วันสิ้นสุดการลา"
                  value={edate}
                  onChange={(newValue) => seteDate(newValue)}
                  format="MM/DD/YYYY"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 12 }}>
                <ToggleButtonGroup
                  value={leaveType}
                  exclusive
                  onChange={handleLeaveTypeChange}
                  aria-label="leave type"
                  sx={{ mt: 2 }}
                >
                  <ToggleButton value="ลาพัก">ลาพัก</ToggleButton>
                  <ToggleButton value="ลาป่วย">ลาป่วย</ToggleButton>
                  <ToggleButton value="ลากิจ">ลากิจ</ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              <Grid size={{ xs: 12, md: 12 }}>
                <TextField
                  label="เหตุผลการลา"
                  multiline
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>
      </Box>
    </Box>
  );
}

export default Absent;
