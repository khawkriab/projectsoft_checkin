import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ArcElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";

import { Bar, Pie } from "react-chartjs-2";

import { useFetcher } from "hooks/useFetcher";
import dayjs from "dayjs";
import "dayjs/locale/th";
dayjs.locale("th");
// 👉 ลงทะเบียน components ที่ Chart.js ใช้
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type DataMonth = {
  month: string;
  monthDescription: string;
  year: number;
  days: DataDate[];
};

type DataDate = {
  date: string;
  day: string;
  weekendFlag: 0 | 1;
  holidayFlag: 0 | 1;
  holidayDescription: string;
  userLeaveTotal: number;
  userCheckInTotal: number;
  userCheckInOnTimeTotal: number;
  userCheckInLateTotal: number;
  userAbsentTotal: number;
};

type DataTrimester = {
  quarter: number;
  startDate: string;
  endDate: string;
  data: TotalDataTrimester[];
};

type TotalDataTrimester = {
  userLeaveTotal: number;
  userCheckInTotal: number;
  userCheckInOnTimeTotal: number;
  userCheckInLateTotal: number;
  userAbsentTotal: number;
};

const backendDataTrimester = {
  data: [
    { trimester: 1, normal: 386, late: 33, absent: 46 },
    { trimester: 2, normal: 350, late: 40, absent: 10 },
    { trimester: 3, normal: 371, late: 12, absent: 60 },
    { trimester: 4, normal: 369, late: 44, absent: 24 },
  ],
};

function Summary() {
  const [dataTotal, setDataTotal] = useState<DataMonth | null>(null);
  const [dataTrimester, setDataTrimester] = useState<DataTrimester | null>(
    null
  );
  const [selectedTrimester, setSelectedTrimester] = useState(1);
  const { POST } = useFetcher();
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const availableYears = Array.from(
    { length: 5 },
    (_, i) => dayjs().year() - i
  );
  const labels =
    dataTotal?.days.map((d) => `วันที่ ${d.date.split("-")[2]}`) || [];

  const normalData = dataTotal?.days.map((d) => d.userCheckInOnTimeTotal) || [];
  const lateData = dataTotal?.days.map((d) => d.userCheckInLateTotal) || [];
  const absentData = dataTotal?.days.map((d) => d.userAbsentTotal) || [];
  const leaveData = dataTotal?.days.map((d) => d.userLeaveTotal) || [];

  const baroptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `สรุปการมาทำงาน - เดือน${dataTotal?.monthDescription ?? ""}`,
      },
    },
  };

  const barData = {
    labels,
    datasets: [
      {
        label: "มาทำงานตรงเวลา",
        data: normalData,
        backgroundColor: "#4CAF50",
      },
      {
        label: "มาสาย",
        data: lateData,
        backgroundColor: "#FFC107",
      },
      {
        label: "ขาดงาน",
        data: absentData,
        backgroundColor: "#F44336",
      },
      {
        label: "ลางาน",
        data: leaveData,
        backgroundColor: "#2196F3",
      },
    ],
  };

  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "สรุปการมาทำงานแยกตามไตรมาส",
      },
    },
  };

  const total = dataTrimester?.data.reduce(
    (acc, curr) => {
      acc.onTime += curr.userCheckInOnTimeTotal;
      acc.late += curr.userCheckInLateTotal;
      acc.leave += curr.userLeaveTotal;
      acc.absent += curr.userAbsentTotal;
      return acc;
    },
    { onTime: 0, late: 0, leave: 0, absent: 0 }
  );

  const pieData = {
    labels: ["มาทำงานปกติ", "มาสาย", "ลางาน", "ขาดงาน"],
    datasets: [
      {
        label: "รวม",
        data: total
          ? [total.onTime, total.late, total.leave, total.absent]
          : [],
        backgroundColor: ["#4CAF50", "#FF9800", "#2196F3", "#F44336"],
        borderWidth: 1,
      },
    ],
  };

  const getDataBar = async (month: number, year: number) => {
    try {
      const result = await POST("/summary/month", {
        mount: month,
        year: year,
      });

      const rawData = result.data;

      const formattedData: DataMonth = {
        month: rawData.mount,
        monthDescription: rawData.mountDescription,
        year: rawData.year,
        days: rawData.TotalData,
      };

      setDataTotal(formattedData);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
    }
  };

  const getDataTrimester = async (quarter: number) => {
    try {
      const result = await POST("/summary/quarter", {
        quarter: quarter,
      });

      const rawData = result.data;
      const formattedData: DataTrimester = {
        quarter: rawData.quarter,
        startDate: rawData.start,
        endDate: rawData.end,
        data: rawData.TotalData,
      };
      setDataTrimester(formattedData);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
    }
  };

  useEffect(() => {
    getDataBar(selectedMonth, selectedYear);
    getDataTrimester(1);
  }, [selectedMonth, selectedYear]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <Box sx={{ width: "100%", maxWidth: 1400 }}>
        <Box marginBottom={3}>
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
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* B1 - Bar Chart */}
          <Box
            sx={{
              flexBasis: "60%",
              border: 1,
              borderColor: "#4b4b4b",
              padding: { xs: 2, md: 4 },
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="month-select-label">เดือน</InputLabel>
                <Select
                  labelId="month-select-label"
                  value={selectedMonth}
                  label="เดือน"
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {monthNames.map((name, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="year-select-label">ปี</InputLabel>
                <Select
                  labelId="year-select-label"
                  value={selectedYear}
                  label="ปี"
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {availableYears.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Bar data={barData} options={baroptions} />
          </Box>

          {/* B2 - Pie Chart */}
          <Box
            sx={{
              flexBasis: "40%",
              border: 1,
              borderColor: "#4b4b4b",
              padding: { xs: 2, md: 4 },
              borderRadius: 2,
            }}
          >
            <Box sx={{ marginBottom: 2, minWidth: 200 }}>
              <FormControl fullWidth>
                <InputLabel id="trimester-select-label">เลือกไตรมาส</InputLabel>
                <Select
                  labelId="trimester-select-label"
                  id="trimesterSelect"
                  value={selectedTrimester}
                  label="เลือกไตรมาส"
                  onChange={(e) => {
                    const quarter = Number(e.target.value);
                    setSelectedTrimester(quarter);
                    getDataTrimester(quarter); // เรียกดึงข้อมูลตามไตรมาสที่เลือก
                  }}
                >
                  {backendDataTrimester.data.map((t) => (
                    <MenuItem key={t.trimester} value={t.trimester}>
                      ไตรมาสที่ {t.trimester}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Pie data={pieData} options={pieOptions} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Summary;
