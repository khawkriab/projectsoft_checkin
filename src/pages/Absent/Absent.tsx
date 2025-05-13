import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  Grid,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function Absent() {
  const [sdate, setsDate] = useState<Dayjs | null>(dayjs());
  const [edate, seteDate] = useState<Dayjs | null>(dayjs());
  const [leaveType, setLeaveType] = useState("ลาพัก");
  const [leavePeriod, setLeavePeriod] = useState("ลาทั้งวัน");
  const [reason, setReason] = useState("");

  const handleLeaveTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newLeaveType: string
  ) => {
    if (newLeaveType !== null) {
      setLeaveType(newLeaveType);
    }
  };

  const handleLeavePeriodChange = (
    event: React.MouseEvent<HTMLElement>,
    newPeriod: string
  ) => {
    if (newPeriod !== null) {
      setLeavePeriod(newPeriod);
    }
  };

  const handleSubmit = () => {
    if (sdate && edate && leaveType && leavePeriod && reason.trim() !== "") {
      console.log("ส่งข้อมูลการลา:", {
        วันเริ่มลา: sdate.format("YYYY-MM-DD"),
        วันสิ้นสุด: edate.format("YYYY-MM-DD"),
        ประเภท: leaveType,
        ช่วงเวลา: leavePeriod,
        เหตุผล: reason,
      });
    } else {
      console.log("กรุณากรอกข้อมูลให้ครบทุกช่อง");
    }
  };
  const isInvalid =
    !sdate || !edate || edate.isBefore(sdate) || reason.trim() === "";
  return (
    <Box sx={{ display: "flex", width: "100%", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 900 }}>
        <Box marginBottom={3}>
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
                  minDate={sdate ?? undefined}
                  slotProps={{
                    textField: {
                      error: !!(edate && sdate && edate.isBefore(sdate)),
                      helperText:
                        edate && sdate && edate.isBefore(sdate)
                          ? "วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น"
                          : "",
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <ToggleButtonGroup
                    value={leaveType}
                    exclusive
                    onChange={handleLeaveTypeChange}
                    aria-label="leave type"
                  >
                    <ToggleButton value="ลาพัก">ลาพักร้อน</ToggleButton>
                    <ToggleButton value="ลาป่วย">ลาป่วย</ToggleButton>
                    <ToggleButton value="ลากิจ">ลากิจ</ToggleButton>
                  </ToggleButtonGroup>

                  <ToggleButtonGroup
                    value={leavePeriod}
                    exclusive
                    onChange={handleLeavePeriodChange}
                    aria-label="leave period"
                  >
                    <ToggleButton
                      value="ลาเช้า"
                      disabled={!sdate?.isSame(edate, "day")}
                    >
                      ลาเช้า{" "}
                    </ToggleButton>
                    <ToggleButton
                      value="ลาบ่าย"
                      disabled={!sdate?.isSame(edate, "day")}
                    >
                      ลาบ่าย
                    </ToggleButton>
                    <ToggleButton value="ลาทั้งวัน">ทั้งวัน</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="เหตุผลการลา"
                  multiline
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={!!(edate && sdate && edate.isBefore(sdate))}
                  >
                    ส่ง
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>
      </Box>
    </Box>
  );
}

export default Absent;
