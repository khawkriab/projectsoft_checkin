import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Divider,
  Typography,
  Stack,
  Switch,
  styled,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
} from "@mui/material";
import { Pie } from "react-chartjs-2";
import { useFetcher } from "hooks/useFetcher";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 40,
  height: 20,
  padding: 0,
  display: "flex",
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(20px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#1890ff",
        opacity: 1,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    width: 16,
    height: 16,
    boxShadow: "none",
  },
  "& .MuiSwitch-track": {
    borderRadius: 20 / 2,
    backgroundColor: "#bfbfbf",
    opacity: 1,
  },
}));

type UserCheckIn = {
  userId: string;
  userNickname: string;
  userImg: string;
  userPhone: string;
  userFullname: string;
  userJobPosition: string;
  userJobStatus: string;
  userEmail: string;
};

type PieData = {
  userLeaveTotal: number;
  userCheckInTotal: number;
  userCheckInOnTimeTotal: number;
  userCheckInLateTotal: number;
  userAbsentTotal: number;
};

function Summary() {
  const { GET, POST } = useFetcher();
  const [isSummary, setIsSummary] = useState(true);
  const [yearPie, setYearPie] = useState<number | null>(null);
  const [trimesterPie, setTrimesterPie] = useState<number | null>(null);
  const [monthPie, setMonthPie] = useState<number | null>(null);
  const [weekPie, setWeekPie] = useState<number | null>(null);
  const [dayPie, setDayPie] = useState<number | null>(null);

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const [employee, setEmployee] = useState<string | null>(null);

  const [dataUser, setDataUser] = useState<UserCheckIn[]>([]);
  const [dataPie, setDataPie] = useState<PieData[] | null>(null);

  const daysInMonth = useMemo(() => {
    if (monthPie && yearPie) {
      return new Date(yearPie, monthPie, 0).getDate();
    }
    return 31;
  }, [monthPie, yearPie]);

  const weeksInMonth = useMemo(() => {
    if (monthPie && yearPie) {
      const start = dayjs(`${yearPie}-${monthPie}-01`);
      const end = start.endOf("month");

      const startDayOfWeek = start.day();
      const totalDays = end.date();

      const totalCells = startDayOfWeek + totalDays;
      return Math.ceil(totalCells / 7);
    }
    return 5;
  }, [monthPie, yearPie]);

  useEffect(() => {
    if (trimesterPie !== null) {
      setMonthPie(null);
      setWeekPie(null);
      setDayPie(null);
    }
  }, [trimesterPie]);

  useEffect(() => {
    if (monthPie !== null) {
      setTrimesterPie(null);
    }
  }, [monthPie]);

  useEffect(() => {
    if (weekPie !== null) {
      setDayPie(null);
    }
  }, [weekPie]);

  useEffect(() => {
    if (dayPie !== null) {
      setWeekPie(null);
    }
  }, [dayPie]);

  const total = dataPie
    ? dataPie.reduce(
        (acc, curr) => {
          acc.onTime += curr.userCheckInOnTimeTotal;
          acc.late += curr.userCheckInLateTotal;
          acc.leave += curr.userLeaveTotal;
          acc.absent += curr.userAbsentTotal;
          return acc;
        },
        { onTime: 0, late: 0, leave: 0, absent: 0 }
      )
    : { onTime: 0, late: 0, leave: 0, absent: 0 };

  const setValue = async (
    startDate: Dayjs | null,
    endDate: Dayjs | null,
    year: number | null,
    quarter: number | null,
    month: number | null,
    week: number | null,
    day: number | null,
    user_id: string | null
  ) => {
    try {
      const result = await POST("/summary/option", {
        start_date: startDate,
        end_date: endDate,
        year: year,
        quarter: quarter,
        month: month,
        week: week,
        day: day,
        user_id: user_id,
      });

      setDataPie(result.data.TotalData);
    } catch (error) {
      console.error("failed to req : ", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const result = await GET("/user");
      const users: UserCheckIn[] = (result.data || []).map((u: any) => ({
        userId: u.user_id,
        userNickname: u.user_nickname,
        userImg: u.user_image_url,
        userPhone: u.user_phonenumber,
        userFullname: u.user_fullname,
        userJobPosition: u.user_job_position,
        userJobStatus: u.user_job_status,
        userEmail: u.user_email,
      }));

      setDataUser(users);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
    }
  };

  const pieData = {
    labels: ["มาทำงานปกติ", "มาสาย", "ลางาน", "ขาดงาน"],
    datasets: [
      {
        label: "รวมทั้งหมด",
        data: [total.onTime, total.late, total.leave, total.absent],

        backgroundColor: ["#4CAF50", "#FF9800", "#2196F3", "#F44336"],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: isSummary ? "สรุปการมาทำงานรวม" : "ข้อมูลรายบุคคล (User A)",
      },
    },
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <Box sx={{ width: "100%", maxWidth: 1200 }}>
        <Box mb={3}>
          <Divider
            textAlign="left"
            sx={{
              color: "#144ad0",
              fontSize: { xs: 20, md: 28 },
              width: "100%",
            }}
          >
            Summary
          </Divider>
        </Box>

        <Box
          sx={{
            width: "100%",
            border: 1,
            borderColor: "#4b4b4b",
            padding: 4,
            borderRadius: 2,
            display: "flex",
            flexDirection: "row",
            gap: 2,
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 600 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Typography>เลือกเอง</Typography>
              <AntSwitch
                checked={isSummary}
                onChange={() => {
                  setIsSummary(!isSummary);
                  setYearPie(null);
                }}
              />
              <Typography>ช่วงเวลา</Typography>
            </Stack>

            {isSummary ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Year"
                    placeholder="YYYY"
                    type="number"
                    value={yearPie || ""}
                    onChange={(e) => setYearPie(Number(e.target.value))}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="trimester-label">Trimester</InputLabel>
                    <Select
                      labelId="trimester-label"
                      value={trimesterPie || ""}
                      label="Trimester"
                      onChange={(e) => setTrimesterPie(Number(e.target.value))}
                      disabled={!yearPie}
                    >
                      <MenuItem value="">
                        <em>none</em>
                      </MenuItem>
                      {[1, 2, 3, 4].map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="month-label">Month</InputLabel>
                    <Select
                      labelId="month-label"
                      value={monthPie || ""}
                      label="Month"
                      onChange={(e) => setMonthPie(Number(e.target.value))}
                      disabled={!yearPie}
                    >
                      <MenuItem value="">
                        <em>none</em>
                      </MenuItem>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <MenuItem key={m} value={m}>
                          {m}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Week</InputLabel>
                    <Select
                      labelId="week-label"
                      value={weekPie || ""}
                      label="Week"
                      onChange={(e) => setWeekPie(Number(e.target.value))}
                      disabled={!yearPie || !monthPie}
                    >
                      <MenuItem value="">
                        <em>none</em>
                      </MenuItem>
                      {[...Array(weeksInMonth)].map((_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {i + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Day</InputLabel>
                    <Select
                      labelId="day-label"
                      value={dayPie || ""}
                      label="Day"
                      onChange={(e) => setDayPie(Number(e.target.value))}
                      disabled={!yearPie || !monthPie}
                    >
                      <MenuItem value="">
                        <em>none</em>
                      </MenuItem>
                      {[...Array(daysInMonth)].map((_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {i + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="employee1-label">employee</InputLabel>
                    <Select
                      labelId="employee-label"
                      value={employee || ""}
                      label="employee"
                      onChange={(e) => setEmployee(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>none</em>
                      </MenuItem>
                      {dataUser.map((user) => (
                        <MenuItem key={user.userId} value={user.userId}>
                          {user.userFullname}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            ) : (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <DatePicker
                      label="วันที่เริ่มต้น"
                      value={startDate}
                      onChange={(newValue) => {
                        setStartDate(newValue);
                        if (endDate && newValue && endDate.isBefore(newValue)) {
                          setEndDate(null);
                        }
                      }}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <DatePicker
                      label="วันที่สิ้นสุด"
                      value={endDate}
                      onChange={(newValue) => {
                        if (
                          newValue &&
                          startDate &&
                          newValue.isBefore(startDate)
                        ) {
                          alert("วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น");
                        } else {
                          setEndDate(newValue);
                        }
                      }}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel id="employee1-label">employee</InputLabel>
                      <Select
                        labelId="employee-label"
                        value={employee || ""}
                        label="employee"
                        onChange={(e) => setEmployee(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>none</em>
                        </MenuItem>
                        {dataUser.map((user) => (
                          <MenuItem key={user.userId} value={user.userId}>
                            {user.userFullname}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </LocalizationProvider>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => {
                  setValue(
                    startDate,
                    endDate,
                    yearPie,
                    trimesterPie,
                    monthPie,
                    weekPie,
                    dayPie,
                    employee
                  );
                  console.log("startDate:", startDate);
                  console.log("endDate:", endDate);
                  console.log("yearPie:", yearPie);
                }}
                disabled={isSummary && yearPie === null}
              >
                View
              </Button>
            </Box>
          </Box>

          <Box sx={{ width: "100%", maxWidth: 450 }}>
            <Pie data={pieData} options={pieOptions} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Summary;
