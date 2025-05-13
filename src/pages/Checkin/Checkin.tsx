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

dayjs.locale("th");

type UserCheckIn = {
  approvedBy: string | null;
  approvedStatus: string | null;
  checkInId: string | null;
  checkinTime: string | null;
  lateTime: string | null;
  userId: string;
  userNickname: string;
  reason: string;
  remark: string;
};

type DataCheckin = {
  date: string;
  holidayFlag: number;
  holidayDescription: string;
  xxxFlag: number;
  userCheckIn: UserCheckIn[];
};

type LocationData = {
  lat: number;
  lng: number;
  errMassage: string;
  allowLocation: boolean;
};

// Custom Table Cell
function CustomTableCell({ children, ...arg }: TableCellProps) {
  return (
    <TableCell {...arg} sx={{ borderLeft: "1px solid #dddddd", ...arg.sx }}>
      {children}
    </TableCell>
  );
}

// Custom Table Header Cell
function CustomTableCellHeader({ children, ...arg }: TableCellProps) {
  return (
    <TableCell
      {...arg}
      sx={{
        borderLeft: "1px solid #dddddd",
        fontWeight: 500,
        fontSize: 24,
        [`&.${tableCellClasses.head}`]: {
          backgroundColor: "secondary.main",
        },
        ...arg.sx,
      }}
    >
      {children}
    </TableCell>
  );
}

function Checkin() {
  const { roleId } = useContext(GoogleLoginContext);
  const { profile } = useGoogleLogin();
  const { POST } = useFetcher();

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

    if (!navigator.geolocation) {
      setLocationData((prev) => ({
        ...prev,
        errMassage: "เบราว์เซอร์ไม่รองรับการใช้งานตำแหน่ง",
        allowLocation: false,
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationData({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          errMassage: "",
          allowLocation: true,
        });
      },
      (error) => {
        setLocationData((prev) => ({
          ...prev,
          errMassage: error.message,
          allowLocation: false,
        }));
      }
    );
  }, []);

  const handleApprove = (checkInId: string | null, approved_status: number) => {
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
  };

  const onClickCheckin = async () => {
    if (!locationData.allowLocation) {
      alert("ยังไม่ได้รับอนุญาตให้เข้าถึงตำแหน่ง: " + locationData.errMassage);
      return;
    }

    try {
      const response = await POST("/checkin/add", {
        reason,
        latitude: locationData.lat,
        longitude: locationData.lng,
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
    <Box sx={{ display: "flex", width: "100%", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 1000 }}>
        {/* Check-in Panel */}
        <Grid container spacing={2} marginBottom={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2} padding={2} alignItems="center">
              <Grid size={{ xs: 12 }}>
                <TimeCurrent />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="เหตุผลที่ work from home"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  fullWidth
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
                  onClick={onClickCheckin}
                  disabled={!locationData.allowLocation}
                  sx={{ borderRadius: "2rem" }}
                >
                  เช็คอินเข้างาน
                </Button>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={!reason || !locationData.allowLocation}
                  fullWidth
                  onClick={onClickCheckin}
                  sx={{ borderRadius: "2rem" }}
                >
                  เช็คอิน WORK FROM HOME
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Check-in Table */}
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                    minWidth: 120,
                    backgroundColor: "#144da0",
                    borderRight: "1px solid #ccc",
                  }}
                >
                  Name
                </TableCell>
                {dataCheckin[0]?.userCheckIn.map((user, index) => (
                  <TableCell
                    key={`user-${index}`}
                    align="center"
                    colSpan={2}
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      minWidth: 120,
                      backgroundColor: "#144da0",
                      borderRight:
                        index !== dataCheckin[0].userCheckIn.length - 1
                          ? "1px solid #ccc"
                          : "none",
                    }}
                  >
                    {user.userNickname}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                    backgroundColor: "#37b4d1",
                    borderRight: "1px solid #eee",
                  }}
                >
                  Date
                </TableCell>
                {dataCheckin[0]?.userCheckIn.map((_, index) => (
                  <React.Fragment key={`subheader-${index}`}>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 500,
                        fontSize: "0.95rem",
                        backgroundColor: "#37b4d1",
                        borderRight: "1px solid #eee",
                      }}
                    >
                      Check-in Time
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 500,
                        fontSize: "0.95rem",
                        backgroundColor: "#37b4d1",
                        borderRight:
                          index !== dataCheckin[0].userCheckIn.length - 1
                            ? "1px solid #ccc"
                            : "none",
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
                <TableRow key={row.date}>
                  <TableCell align="center">{row.date}</TableCell>
                  {row.userCheckIn.map((user) => (
                    <React.Fragment key={`${row.date}-${user.userId}`}>
                      <TableCell align="center" sx={{ minWidth: 95 }}>
                        {user.checkinTime || user.lateTime || "XX:XX"}
                      </TableCell>
                      <UserApprovalCell
                        user={user}
                        handleApprove={handleApprove}
                        roleid={roleId}
                        checkinID={user.checkInId}
                      />
                    </React.Fragment>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default Checkin;
