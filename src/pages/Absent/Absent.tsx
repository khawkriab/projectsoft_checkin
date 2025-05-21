import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  Grid,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  FormControl,
  FormLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useFetcher } from "hooks/useFetcher";

function Absent() {
  const [sdate, setsDate] = useState<Dayjs | null>(dayjs());
  const [edate, seteDate] = useState<Dayjs | null>(dayjs());
  const [leaveType, setLeaveType] = useState("");
  const [leavePeriod, setLeavePeriod] = useState("");
  const [reason, setReason] = useState("");
  const { POST } = useFetcher();
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

  const handleSubmit = async () => {
    if (sdate && edate && leaveType && leavePeriod && reason.trim() !== "") {
      const payload = {
        startDate: sdate.format("YYYY-MM-DD"),
        endDate: edate.format("YYYY-MM-DD"),
        leaveType: leaveType,
        leaveTime: leavePeriod,
        leaveReason: reason,
      };

      try {
        const response = await POST("/userleave/create", payload);
        alert("ส่งคำขอลาสำเร็จ");
        console.log("ส่งข้อมูลการลา:", response);
      } catch (error) {
        console.error("ส่งคำขอลาไม่สำเร็จ:", error);
        alert("เกิดข้อผิดพลาดในการส่งคำขอลา");
      }
    } else {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
    }
  };

  const isInvalid =
    !sdate || !edate || edate.isBefore(sdate) || reason.trim() === "";
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
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
            padding: { xs: 2, md: 4 },
            borderRadius: 2,
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column" },
                gap: 2,
              }}
              marginBottom={3}
            >
              {/* B Date */}
              <Box
                sx={{
                  flex: 1,
                  padding: 2,
                  border: 1,
                  borderColor: "#ccc",
                  borderRadius: 2,
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker
                      label="วันเริ่มลา"
                      value={sdate}
                      onChange={(newValue) => setsDate(newValue)}
                      format="MM/DD/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
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
                          fullWidth: true,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* B type */}
              <Box
                sx={{
                  flex: 1,
                  padding: 2,
                  border: 1,
                  borderColor: "#ccc",
                  borderRadius: 2,
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth variant="outlined" margin="dense">
                      <FormLabel
                        sx={{
                          fontSize: "1rem",
                          color: "rgba(0, 0, 0, 0.6)",
                          marginBottom: "4px",
                        }}
                      >
                        ประเภทการลา
                      </FormLabel>
                      <ToggleButtonGroup
                        value={leaveType}
                        exclusive
                        onChange={handleLeaveTypeChange}
                        aria-label="leave type"
                        fullWidth
                      >
                        <ToggleButton value={1}>ลาพักร้อน</ToggleButton>
                        <ToggleButton value={2}>ลาป่วย</ToggleButton>
                        <ToggleButton value={3}>ลากิจ</ToggleButton>
                      </ToggleButtonGroup>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth variant="outlined" margin="dense">
                      <FormLabel
                        sx={{
                          fontSize: "1rem",
                          color: "rgba(0, 0, 0, 0.6)",
                          marginBottom: "4px",
                        }}
                      >
                        ช่วงเวลา
                      </FormLabel>
                      <ToggleButtonGroup
                        value={leavePeriod}
                        exclusive
                        onChange={handleLeavePeriodChange}
                        aria-label="leave period"
                        //label="ช่วงเวลา"
                        fullWidth
                      >
                        <ToggleButton
                          value={1}
                          disabled={!sdate?.isSame(edate, "day")}
                        >
                          ลาเช้า
                        </ToggleButton>
                        <ToggleButton
                          value={2}
                          disabled={!sdate?.isSame(edate, "day")}
                        >
                          ลาบ่าย
                        </ToggleButton>
                        <ToggleButton value={3}>ทั้งวัน</ToggleButton>
                      </ToggleButtonGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {/* เหตุผล และปุ่มส่ง */}
            <Grid container rowSpacing={3} columnSpacing={2}>
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
