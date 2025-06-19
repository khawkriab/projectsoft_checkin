import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputLabel,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import { useFetcher } from "hooks/useFetcher";
import { GoogleLoginContext } from "../../components/GoogleLoginProvider/GoogleLoginProvider";

dayjs.locale("th");

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

type DataStaff = {
  startDate: string;
  endDate: string;
  staff: Staff[];
};

type Staff = {
  userName: string;
  userNickName: string;
  userId: string;
};

function Schedule() {
  const { roleId } = useContext(GoogleLoginContext);
  const { GET, POST } = useFetcher();
  const [dataUser, setDataUser] = useState<UserCheckIn[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [employee1, setEmployee1] = useState<string>("");
  const [employee2, setEmployee2] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [dataObject, setDataObject] = useState<DataStaff[]>([]);

  const fetchUsers = async () => {
    try {
      const result = await GET("/user");
      console.log("result:", result);

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

  const getTable = async () => {
    setLoading(true);
    try {
      const result = await GET("/roleschedule");
      const table: DataStaff[] = (result.data || []).map((obj: any) => ({
        startDate: obj.staff_start_date,
        endDate: obj.staff_end_date,
        staff: (obj.staff || []).map((s: any) => ({
          userId: s.user_id,
          userNickName: s.user_nickname,
          userName: s.user_fullname,
        })),
      }));
      setDataObject([...table]);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
    } finally {
      setLoading(false);
    }
  };

  const setUser = (
    startDate: Dayjs | null,
    endDate: Dayjs | null,
    userIds: string[]
  ) => {
    setLoading(true);
    if (!startDate || !endDate || userIds.length === 0) {
      alert("กรุณาระบุวันที่เริ่มต้น สิ้นสุด และพนักงานอย่างน้อย 1 คน");
      return;
    }

    POST("/roleschedule/create", {
      staff_start_date: startDate.format("YYYY-MM-DD"),
      staff_end_date: endDate.format("YYYY-MM-DD"),
      user_id: userIds,
    }).catch((err) => {
      console.error("Approve Error:", err?.response?.data || err.message);
    });
    getTable();
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    getTable();
  }, []);

  const isAdmin = roleId === 1;
  const isStaff = roleId === 2;
  const isUser = roleId === 3;

  if (loading) return <div>Loading...</div>;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        //border: 1,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 900 }}>
        {/* Section Title */}
        <Box marginBottom={3}>
          <Divider
            textAlign="left"
            sx={{
              color: "#144ad0",
              fontSize: { xs: 20, md: 28 },
              width: "100%",
            }}
          >
            Schedule
          </Divider>
        </Box>
        {isAdmin && (
          <>
            {/* Form Section */}
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
                  {/* Date Pickers */}
                  <Box
                    sx={{
                      flex: 1,
                      padding: 2,
                      border: 0,
                      borderColor: "#ccc",
                      borderRadius: 2,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <DatePicker
                          label="วันที่เริ่มต้น"
                          value={startDate}
                          onChange={(newValue) => {
                            setStartDate(newValue);
                            if (
                              endDate &&
                              newValue &&
                              endDate.isBefore(newValue)
                            ) {
                              setEndDate(null);
                            }
                          }}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
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
                    </Grid>
                  </Box>

                  {/* Staff Select */}
                  <Box
                    sx={{
                      flex: 1,
                      padding: 2,
                      border: 0,
                      borderColor: "#ccc",
                      borderRadius: 2,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                          <InputLabel id="employee1-label">Staff 1</InputLabel>
                          <Select
                            labelId="employee1-label"
                            value={employee1 || ""}
                            label="Staff 1"
                            onChange={(e) => setEmployee1(e.target.value)}
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
                      <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                          <InputLabel id="employee2-label">Staff 2</InputLabel>
                          <Select
                            labelId="employee2-label"
                            value={employee2 || ""}
                            label="Staff 2"
                            onChange={(e) => setEmployee2(e.target.value)}
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
                  </Box>
                </Box>

                {/* Button */}
                <Grid container rowSpacing={3} columnSpacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        variant="contained"
                        onClick={() => {
                          const userIds = [employee1, employee2].filter(
                            Boolean
                          ); // กรอง null/undefined
                          setUser(startDate, endDate, userIds);
                        }}
                        disabled={!employee1 || !startDate || !endDate}
                      >
                        set
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Box>
          </>
        )}

        {/* Table Section */}
        <Box mt={4}>
          <TableContainer
            sx={{
              maxHeight: 500,
              overflowY: "auto",
              overflowX: "auto",
              border: 1,
              borderColor: "#ccc",
              borderRadius: 2,
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>วันที่เริ่ม</TableCell>
                  <TableCell>วันที่สิ้นสุด</TableCell>
                  <TableCell>Staff 1</TableCell>
                  <TableCell>Staff 2</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataObject.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.startDate}</TableCell>
                    <TableCell>{item.endDate}</TableCell>
                    <TableCell>{item.staff[0]?.userName || "-"}</TableCell>
                    <TableCell>{item.staff[1]?.userName || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}

export default Schedule;
