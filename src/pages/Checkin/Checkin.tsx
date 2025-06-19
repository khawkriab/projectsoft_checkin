import React, { useContext, useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from "@mui/material";
import { useFetcher } from "hooks/useFetcher";
import UserApprovalCell from "../../components/tool/UserApprovalCell";
import { GoogleLoginContext } from "../../components/GoogleLoginProvider/GoogleLoginProvider";
import TimeCurrent from "components/tool/TimeCurrent";
import LocationChecker from "components/tool/LocationChecker";
import { useGoogleLogin } from "components/GoogleLoginProvider";

export type UserCheckIn = {
  userId: string;
  userNickName: string;
  checkinTime: string | null;
  status: string | null;
  checkInData: CheckInData;
  leaveData: LeaveData;
};

export type CheckInData = {
  checkInId: string;
  checkInStatus: 0 | 1 | 99 | null;
  checkInDescription: "Approved" | "Rejected" | "Pending";
  remark: string;
  where: "Onsite" | "WFH";
};

export type LeaveData = {
  leaveId: string;
  leaveTypeId: 1 | 2 | 3;
  leaveTimeId: 1 | 2 | 3;
  leaveStatus: 0 | 1 | 99 | null;
  leaveDescription: "Approved" | "Rejected" | "Pending";
  remark: string;
};

type DataCheckin = {
  date: string;
  day: string;
  weekendFlag: number;
  holidayFlag: number;
  holidayDescription: string;
  userCheckIn: UserCheckIn[];
};

type Attendance = {
  present: number;
  absent: number;
  leave: number;
};

type LocationData = {
  lat: number;
  lng: number;
  errMassage: string;
  allowLocation: boolean;
};

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

function Checkin() {
  const { roleId } = useContext(GoogleLoginContext);
  const [reason, setReason] = useState("");
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [inRange, setInRange] = useState(false);
  const { profile, signinStatus } = useGoogleLogin();
  const [locationData, setLocationData] = useState<LocationData>({
    lat: 0,
    lng: 0,
    errMassage: "",
    allowLocation: false,
  });
  const [attendanceData, setAttendanceData] = useState<
    Record<string, Attendance>
  >({});
  const [dataCheckin, setDataCheckin] = useState<DataCheckin[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<Attendance | null>(null);

  const [dataTotal, setDataTotal] = useState<DataMonth | null>(null);

  const [selectedUserCheckin, setSelectedUserCheckin] = useState<
    UserCheckIn[] | null
  >(null);

  const { POST } = useFetcher();

  const onClickCheckin = async (wfh: number) => {
    if (!locationData.allowLocation) {
      alert("ยังไม่ได้รับอนุญาตให้เข้าถึงตำแหน่ง: " + locationData.errMassage);
      return;
    }

    try {
      const response = await POST("/checkin/add", {
        remarks: reason || null,
        latitude: locationData.lat,
        longitude: locationData.lng,
        attendanceStatus: wfh,
      });
      fetchUsers(currentMonth.month() + 1, currentMonth.year());
      alert("เช็คอินสำเร็จ");
    } catch (error) {
      console.error("เช็คอินไม่สำเร็จ:", error);
    }
  };

  const fetchUsers = async (month: number, year: number) => {
    try {
      const result = await POST("/checkin/getCheckIn", {
        mount: month,
        year: year,
      });
      setDataCheckin(result.data.checkInData || []);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
    }
  };

  const ApproveWork = (checkInId: string | null, approved_status: number) => {
    POST(
      "/approve/checkin",
      {
        checkInId,
        approved_status,
      },
      {
        headers: {
          "user-id": checkInId ?? "",
        },
      }
    ).catch((err) => {
      console.error("Approve Error:", err?.response?.data || err.message);
    });
    fetchUsers(currentMonth.month() + 1, currentMonth.year());
  };

  const ApproveLeave = (leaveId: string | null, approved_status: number) => {
    POST(
      "/approve/leaverequests",
      {
        leaveId,
        approved_status,
      },
      {
        headers: {
          "user-id": leaveId ?? "",
        },
      }
    ).catch((err) => {
      console.error("Approve Error:", err?.response?.data || err.message);
    });
    fetchUsers(currentMonth.month() + 1, currentMonth.year());
  };

  const getMonth = async (month: number, year: number) => {
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

  const handleOpenDialog = (dateStr: string, data: Attendance) => {
    setSelectedDate(dateStr);
    setSelectedData(data);

    const dayData = dataCheckin.find((d) => d.date === dateStr);
    setSelectedUserCheckin(dayData?.userCheckIn || []);

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handlePrevMonth = () => {
    const newMonth = currentMonth.subtract(1, "month");
    setCurrentMonth(newMonth);
    fetchUsers(newMonth.month() + 1, newMonth.year());
  };

  const handleNextMonth = () => {
    const newMonth = currentMonth.add(1, "month");
    setCurrentMonth(newMonth);
    fetchUsers(newMonth.month() + 1, newMonth.year());
  };

  useEffect(() => {
    const daysInMonth = currentMonth.daysInMonth();
    const newData: Record<string, Attendance> = {};

    setAttendanceData(newData);
    fetchUsers(currentMonth.month() + 1, currentMonth.year());
    getMonth(currentMonth.month() + 1, currentMonth.year());
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = currentMonth.date(i).format("YYYY-MM-DD");

      newData[dateStr] = {
        present: 0,
        absent: 0,
        leave: 0,
      };
    }
  }, [currentMonth]);

  const startOfMonth = currentMonth.startOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = currentMonth.daysInMonth();

  const weeks = [];
  let day = 1 - startDay;

  for (let week = 0; week < 6; week++) {
    const days = [];

    for (let i = 0; i < 7; i++, day++) {
      if (day > 0 && day <= daysInMonth) {
        const dateStr = currentMonth.date(day).format("YYYY-MM-DD");

        const matchedDay = dataTotal?.days.find(
          (d) => dayjs(d.date).format("YYYY-MM-DD") === dateStr
        );

        const data = {
          present: matchedDay?.userCheckInLateTotal || 0,
          absent: matchedDay?.userAbsentTotal || 0,
          leave: matchedDay?.userLeaveTotal || 0,
        };

        days.push(
          <TableCell
            key={i}
            align="center"
            sx={{
              backgroundColor: (() => {
                const cellDate = new Date(dateStr);
                const today = new Date();
                const isSameDay =
                  cellDate.getDate() === today.getDate() &&
                  cellDate.getMonth() === today.getMonth() &&
                  cellDate.getFullYear() === today.getFullYear();

                if (isSameDay) return "#C9DCF8";

                const dayOfWeek = cellDate.getDay();
                if (dayOfWeek === 0) return "#ffe6e6";
                if (dayOfWeek === 6) return "#f3e5f5";
                return "#ffffff";
              })(),
            }}
          >
            <Typography variant="subtitle2">{day}</Typography>
            <Typography variant="caption">มา: {data.present}</Typography>
            <br />
            <Typography variant="caption">ไม่มา: {data.absent}</Typography>
            <br />
            <Typography variant="caption">ลา: {data.leave}</Typography>
            <br />
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleOpenDialog(dateStr, data)}
              sx={{ backgroundColor: "#ffffff" }}
            >
              ทำรายการ
            </Button>
          </TableCell>
        );
      } else {
        days.push(<TableCell key={i}></TableCell>);
      }
    }

    weeks.push(<TableRow key={week}>{days}</TableRow>);
  }
  if (!dataTotal) return <div>Loading...</div>;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
        <Box marginBottom={3}>
          <Divider
            textAlign="left"
            sx={{
              color: "#144ad0",
              fontSize: { xs: 20, md: 28 },
              width: "100%",
            }}
          >
            Check-in
          </Divider>
        </Box>

        {/* Check-in and Calendar side-by-side */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            justifyContent: "center", // center children horizontally
            alignItems: "flex-start", // optional: align top edges
          }}
        >
          {/* Check-in Section */}
          <Box
            sx={{
              flex: "1 1 380px",
              maxWidth: 420,
              p: 3,
              borderRadius: 3,
              boxShadow: 1,
              backgroundColor: "#fff",
              minWidth: 300,
            }}
          >
            <LocationChecker
              onLocationUpdate={({
                isWithin,
                location,
                allowLocation,
                errMassage,
              }) => {
                setInRange(isWithin);
                setLocationData({
                  lat: location.lat,
                  lng: location.lng,
                  allowLocation,
                  errMassage,
                });
              }}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TimeCurrent />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="เหตุผลที่ WFH หรือมาสาย"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => onClickCheckin(0)}
                  disabled={!inRange || !signinStatus}
                  sx={{ borderRadius: 4, py: 1.5 }}
                >
                  เช็คอินเข้างาน
                </Button>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => onClickCheckin(1)}
                  disabled={
                    !reason || !locationData.allowLocation || !signinStatus
                  }
                  sx={{ borderRadius: 4, py: 1.5 }}
                >
                  เช็คอิน WFH
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Calendar Section */}
          <Box
            sx={{
              borderRadius: 3,
              boxShadow: 1,
              flex: "2 1 600px",
              maxWidth: 800,
              p: 3,
              backgroundColor: "#fff",
            }}
          >
            <Typography variant="h5" align="center" gutterBottom>
              ปฏิทินประจำเดือน
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Button variant="outlined" onClick={handlePrevMonth}>
                ←
              </Button>
              <Typography variant="h6" sx={{ mx: 3 }}>
                {currentMonth.format("MMMM YYYY")}
              </Typography>
              <Button variant="outlined" onClick={handleNextMonth}>
                →
              </Button>
            </Box>

            <Paper sx={{ overflowX: "auto", borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
                      <TableCell
                        key={day}
                        align="center"
                        sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                      >
                        {day}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>{weeks}</TableBody>
              </Table>
            </Paper>
          </Box>
        </Box>

        {/* Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>ข้อมูลวันที่ {selectedDate}</DialogTitle>
          <DialogContent dividers>
            {selectedUserCheckin && selectedUserCheckin.length > 0 ? (
              <Grid container spacing={2}>
                {selectedUserCheckin.map((user) => (
                  <Grid size={{ xs: 12 }} key={user.userId}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        {user.userNickName}
                      </Typography>
                      <UserApprovalCell
                        user={user}
                        ApproveWork={ApproveWork}
                        ApproveLeave={ApproveLeave}
                        roleId={roleId}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography align="center" color="textSecondary">
                ไม่พบข้อมูลผู้ใช้งานในวันนี้
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>ปิด</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default Checkin;
