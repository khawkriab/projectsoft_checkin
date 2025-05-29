import React, { useContext, useEffect, useState } from "react";
import { deviceDetect } from "react-device-detect";
import dayjs from "dayjs";
import "dayjs/locale/th";
import {
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableCellProps,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

import { useGoogleLogin } from "components/GoogleLoginProvider";
import { useFetcher } from "hooks/useFetcher";
import TimeCurrent from "../../components/tool/TimeCurrent";
import UserApprovalCell from "../../components/tool/UserApprovalCell";
import { GoogleLoginContext } from "../../components/GoogleLoginProvider/GoogleLoginProvider";
import LocationChecker from "components/tool/LocationChecker";

dayjs.locale("th");

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
  checkInStatus: 0 | 1 | 99 | null; // 0:reject,1:approve , 99:pending
  checkInDescription: "Approved" | "Rejected" | "Pending";
  remark: string;
  where: "Onsite" | "WFH";
};

export type LeaveData = {
  leaveId: string;
  leaveTypeId: 1 | 2 | 3; // 1 ลาพักร้อน , 2 ลาป่วย , 3 ลากิจ
  leaveTimeId: 1 | 2 | 3; // 1 ลาเช้า , 2 ลาบ่าย , 3 ลาทั้งวัน
  leaveStatus: 0 | 1 | 99 | null; // 0:reject,1:approve , 99:pending
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

type LocationData = {
  lat: number;
  lng: number;
  errMassage: string;
  allowLocation: boolean;
};

function Checkin() {
  const { roleId } = useContext(GoogleLoginContext);
  const { profile, signinStatus } = useGoogleLogin();
  console.log("signinStatus:", signinStatus);
  const { POST } = useFetcher();
  const [inRange, setInRange] = useState(false);

  const [attendanceStatus, setattendanceStatus] = useState();
  const [loading, setLoading] = useState(true);
  const [dataCheckin, setDataCheckin] = useState<DataCheckin[]>([]);

  const [reason, setReason] = useState("");

  const [locationData, setLocationData] = useState<LocationData>({
    lat: 0,
    lng: 0,
    errMassage: "",
    allowLocation: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

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
    fetchUsers();
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
    fetchUsers();
  };

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
      fetchUsers();
      alert("เช็คอินสำเร็จ");
    } catch (error) {
      console.error("เช็คอินไม่สำเร็จ:", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await POST("/checkin/getCheckIn", {
        mount: dayjs().month() + 1,
        year: dayjs().year(),
      });
      setDataCheckin(result.checkInData || []);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Box
      sx={{
        width: "100%",

        bgcolor: "white",
        borderRadius: 2,

        p: 3,
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

      {/* Check-in Panel */}
      <Grid container spacing={3} marginBottom={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={2} padding={2} alignItems="center">
            <Grid size={{ xs: 12 }}>
              <TimeCurrent />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="เหตุผลที่ work from home หรือ มาสาย"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                fullWidth
                size="medium"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={2} padding={2} alignItems="center">
            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => onClickCheckin(0)}
                disabled={!inRange}
                //
                sx={{ borderRadius: "2rem", py: 1.5, fontSize: "1rem" }}
              >
                เช็คอินเข้างาน
              </Button>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                variant="outlined"
                color="primary"
                disabled={
                  !reason || !locationData.allowLocation || !signinStatus
                }
                fullWidth
                onClick={() => onClickCheckin(1)}
                sx={{ borderRadius: "2rem", py: 1.5, fontSize: "1rem" }}
              >
                เช็คอิน WORK FROM HOME
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Check-in Table */}
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 500,
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        <Table stickyHeader sx={{ minWidth: 400 }}>
          <TableHead>
            <TableRow sx={{ zIndex: 20, position: "sticky", top: 0 }}>
              <TableCell
                align="center"
                sx={{
                  zIndex: 10,
                  fontWeight: "bold",
                  fontSize: "1rem",
                  minWidth: 140,
                  backgroundColor: "#144da0",
                  borderRight: "1px solid #ccc",
                  color: "white",
                }}
              >
                Name
              </TableCell>
              {dataCheckin[0]?.userCheckIn?.map((user, index) => {
                return (
                  <TableCell
                    key={`user-${index}`}
                    align="center"
                    colSpan={2}
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      minWidth: 140,
                      backgroundColor: "#144da0",
                      borderRight:
                        index !== dataCheckin[0].userCheckIn.length - 1
                          ? "1px solid #ccc"
                          : "none",
                      color: "white",
                    }}
                  >
                    {user.userNickName}
                  </TableCell>
                );
              })}
            </TableRow>

            <TableRow sx={{ zIndex: 20, position: "sticky", top: 57 }}>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  backgroundColor: "#37b4d1",
                  borderRight: "1px solid #eee",
                  color: "white",
                }}
              >
                Date
              </TableCell>
              {dataCheckin[0]?.userCheckIn.map((_, index) => (
                <React.Fragment key={`subheader-${index}`}>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      fontSize: "1rem",
                      backgroundColor: "#37b4d1",
                      borderLeft: "1px solid #ccc",
                      color: "white",
                      minWidth: 150,
                    }}
                  >
                    Check-in Time
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      fontSize: "1rem",
                      backgroundColor: "#37b4d1",
                      borderLeft: "1px solid #ccc",
                      borderRight: "1px solid #ccc",
                      color: "white",
                      minWidth: 130,
                    }}
                  >
                    Status
                  </TableCell>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {dataCheckin.map((row) => (
              <TableRow key={row.date} hover>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    backgroundColor: "#f0f4f8",
                    borderRight: "1px solid #eee",
                    minWidth: 140,
                  }}
                >
                  {row.date}
                </TableCell>
                {row.userCheckIn.map((user) => (
                  <React.Fragment key={`${row.date}-${user.userId}`}>
                    <TableCell
                      align="center"
                      sx={{
                        minWidth: 120,
                        backgroundColor: "#fafafa",
                        borderRight: "1px solid #eee",
                        fontSize: "0.95rem",
                      }}
                    >
                      {user.checkinTime ?? ""}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        fontSize: "0.95rem",
                        borderRight: "1px solid #eee",
                        minWidth: 250,
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <UserApprovalCell
                        date={row.date}
                        user={user}
                        ApproveWork={ApproveWork}
                        ApproveLeave={ApproveLeave}
                        roleId={roleId}
                      />
                    </TableCell>
                  </React.Fragment>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Checkin;
