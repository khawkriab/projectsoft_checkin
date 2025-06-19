import React, { useContext, useEffect, useState } from "react";
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
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useFetcher } from "hooks/useFetcher";
import { GoogleLoginContext } from "components/GoogleLoginProvider/GoogleLoginProvider";
import { useGoogleLogin } from "components/GoogleLoginProvider";

type Ticket = {
  TID: string;
  userID: string;
  user_nickname: string;
  start_date: string;
  end_date: string;
  leave_type_id: number;
  leave_time_id: number;

  leave_reason: string;
  approved_by: string;
  approved_status_id: 0 | 1 | 99;
};

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

function Absent() {
  const { profile, signinStatus } = useGoogleLogin();

  const [sdate, setsDate] = useState<Dayjs | null>(dayjs());
  const [edate, seteDate] = useState<Dayjs | null>(dayjs());
  const [leaveType, setLeaveType] = useState("");
  const [leavePeriod, setLeavePeriod] = useState("");
  const [reason, setReason] = useState("");

  const [dataUser, setDataUser] = useState<UserCheckIn[]>([]);

  const [employee, setEmployee] = useState<string | null>(null);

  const { GET, POST } = useFetcher();

  const [leaveForm, setLeaveForm] = useState<{
    sdate: Dayjs | null;
    edate: Dayjs | null;
    leaveType: string;
    leavePeriod: string;
    reason: string;
    userId: string;
  }>({
    sdate: dayjs(),
    edate: dayjs(),
    leaveType: "ลาพักร้อน",
    leavePeriod: "เช้า",
    reason: "",
    userId: "",
  });

  const [editLeaveForm, setEditLeaveForm] = useState<{
    sdate: Dayjs | null;
    edate: Dayjs | null;
    leaveType: string;
    leavePeriod: string;
    reason: string;
    userId: string;
  }>({
    sdate: dayjs(),
    edate: dayjs(),
    leaveType: "",
    leavePeriod: "",
    reason: "",
    userId: "",
  });

  const [openDialog, setOpenDialog] = useState(false); //for new ticket
  const [openDialog2, setOpenDialog2] = useState(false); //for edit ticket

  const { roleId } = useContext(GoogleLoginContext);

  const [dataList, setDataList] = useState<Ticket[]>([]);

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
    console.log("leaveForm.sdate :", leaveForm.sdate);
    console.log("leaveForm.edate :", leaveForm.edate);
    console.log("leaveForm.leaveType :", leaveForm.leaveType);
    console.log("leaveForm.leavePeriod :", leaveForm.leavePeriod);
    console.log("leaveForm.reason :", leaveForm.reason);
    if (
      leaveForm.sdate &&
      leaveForm.edate &&
      leaveForm.leaveType &&
      leaveForm.leavePeriod &&
      leaveForm.reason.trim() !== ""
    ) {
      const payload = {
        startDate: leaveForm.sdate.format("YYYY-MM-DD"),
        endDate: leaveForm.edate.format("YYYY-MM-DD"),
        leaveType: leaveForm.leaveType,
        leaveTime: leaveForm.leavePeriod,
        leaveReason: leaveForm.reason,
      };

      try {
        const response = await POST("/userleave/create", payload);
        alert("ส่งคำขอลาสำเร็จ");
        console.log("ส่งข้อมูลการลา:", response);
        setOpenDialog(false);
      } catch (error) {
        console.error("ส่งคำขอลาไม่สำเร็จ:", error);
        alert("เกิดข้อผิดพลาดในการส่งคำขอลา");
      }
    } else {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
    }
  };

  const updateTicket = async () => {
    try {
      const result = await POST("/userleave/update", {
        leaveId: "107563237098177333625_20250701_20250701_01_01",
        startDate: "2025-09-01",
        endDate: "2025-09-01",
        leaveType: 3,
        leaveTime: 2,
        leaveReason: "แก้ไขลา",
      });
      console.log("result:", result);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
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

  const userFetchUsers = async (userId?: string | null) => {
    console.log("userId:", userId);
    try {
      const result = await POST("/userleave/user", {
        user_id: userId ?? profile?.id,
      });

      const Data: Ticket[] = (result.data || []).map((u: any) => ({
        TID: u.leave_id,
        userID: u.user_id,
        user_nickname: u.user_nickname,
        start_date: u.start_date,
        end_date: u.end_date,
        leave_type_id: u.leave_type_id,
        leave_time_id: u.leave_time_id,
        leave_reason: u.leave_reason,
        approved_by: u.approved_by,
        approved_status_id: u.approved_status_id,
      }));

      setDataList(Data);
      console.log("Data:", Data);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
    }
  };

  const adminFetchUsers = async () => {
    try {
      const result = await GET("/userleave");
      const Data: Ticket[] = (result.data || []).map((u: any) => ({
        TID: u.leave_id,
        userID: u.user_id,
        user_nickname: u.user_nickname,
        start_date: u.start_date,
        end_date: u.end_date,
        leave_type_id: u.leave_type_id,
        leave_time_id: u.leave_time_id,
        leave_reason: u.leave_reason,
        approved_by: u.approved_by,
        approved_status_id: u.approved_status_id,
      }));
      setDataList(Data);
      console.log("Data:", Data);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
    }
  };

  const delTicket = async (ticket: string) => {
    try {
      const result = await POST("/userleave/delete", {
        leaveId: ticket,
      });
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
    }
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
  };

  useEffect(() => {
    roleId === 3 && userFetchUsers();
    roleId === 1 && adminFetchUsers();
    fetchUsers();
  }, []);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
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

        {/* MOCK DATA LIST */}
        <Box
          sx={{
            width: "100%",
            border: 1,
            borderColor: "#4b4b4b",
            padding: { xs: 2, md: 4 },
            borderRadius: 2,
            marginBottom: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mb: 3,
              flexWrap: "wrap",
            }}
          >
            <FormControl fullWidth sx={{ maxWidth: 250 }}>
              <InputLabel id="employee-label">employee</InputLabel>
              <Select
                labelId="employee-label"
                value={employee || ""}
                label="employee"
                onChange={(e) => setEmployee(e.target.value)}
                disabled={roleId === 3}
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

            <Button
              variant="contained"
              onClick={() => {
                if (roleId === 3) {
                  userFetchUsers(null);
                } else if (roleId === 1) {
                  if (employee) {
                    userFetchUsers(employee);
                  } else {
                    adminFetchUsers();
                  }
                }
              }}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                bgcolor: "#fff",
                color: "#000",
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#eee",
                },
              }}
            >
              รีเฟรช
            </Button>
            <Button
              onClick={() => {
                updateTicket();
              }}
            >
              5555555
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenDialog(true)}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                ml: 1,
                bgcolor: "#1976d2",
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#1565c0",
                },
              }}
            >
              เพิ่มใบลางาน
            </Button>
          </Box>

          {dataList.length === 0 ? (
            <Typography>ไม่มีข้อมูลการลา</Typography>
          ) : (
            dataList.map((item) => (
              <Card
                key={item.TID}
                variant="outlined"
                sx={{ marginBottom: 2, backgroundColor: "#f9f9f9" }}
              >
                <CardContent>
                  <Grid container alignItems="center" sx={{ border: 1 }}>
                    {/* info */}
                    <Grid sx={{ border: 1 }} size={{ xs: 12, md: 6 }}>
                      <Typography>👤 ผู้ขอ: {item.user_nickname}</Typography>
                      <Typography>
                        ⏳ เวลา: {item.start_date} - {item.end_date}
                      </Typography>
                    </Grid>

                    {/* button */}

                    {item.approved_status_id === 1 && (
                      <Box sx={{ ml: 2 }}>
                        <span>Approved</span>
                      </Box>
                    )}

                    {item.approved_status_id === 0 && (
                      <Box sx={{ ml: 2, alignSelf: "center" }}>
                        <span>Reject</span>
                      </Box>
                    )}

                    {item.approved_status_id === 99 && (
                      <Grid
                        container
                        size={{ xs: 12, md: 6 }}
                        justifyContent="flex-end"
                        sx={{ border: 1, color: "red", p: 2 }}
                      >
                        <Stack spacing={1} direction="row" alignItems="center">
                          <Button
                            variant="contained"
                            sx={{
                              backgroundColor: "white",
                              color: "black",
                            }}
                            onClick={() => {
                              setEditLeaveForm((prev) => ({
                                ...prev,
                                sdate: dayjs(item.start_date),
                                edate: dayjs(item.end_date),
                                leaveType:
                                  item.leave_type_id === 1
                                    ? "ลาพักร้อน"
                                    : item.leave_type_id === 2
                                    ? "ลาป่วย"
                                    : item.leave_type_id === 3
                                    ? "ลากิจ"
                                    : "",
                                leavePeriod:
                                  item.leave_time_id === 1
                                    ? "เช้า"
                                    : item.leave_time_id === 2
                                    ? "บ่าย"
                                    : item.leave_type_id === 3
                                    ? "ทั้งวัน"
                                    : "",
                                reason: item.leave_reason,
                                userId: item.userID,
                              }));
                              setOpenDialog2(true);
                            }}
                          >
                            รายละเอียด
                          </Button>

                          {profile?.id === item.userID && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => delTicket(item.TID)}
                            >
                              ลบ
                            </Button>
                          )}

                          {roleId === 1 && (
                            <>
                              <Button
                                variant="contained"
                                sx={{
                                  backgroundColor: "green",
                                  color: "white",
                                }}
                                onClick={() => ApproveLeave(item.TID, 1)}
                              >
                                อนุมัติ
                              </Button>

                              <Button
                                variant="contained"
                                sx={{
                                  backgroundColor: "gold",
                                  color: "black",
                                }}
                                onClick={() => ApproveLeave(item.TID, 0)}
                              >
                                ไม่อนุมัติ
                              </Button>
                            </>
                          )}
                        </Stack>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            ))
          )}
        </Box>

        {/* Dialog create */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>เพิ่มใบลางาน</DialogTitle>
          <DialogContent dividers>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* วันที่ลา */}
                <Box
                  sx={{
                    padding: 2,
                    border: 1,
                    borderColor: "#ccc",
                    borderRadius: 2,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DatePicker
                        label="วันเริ่มลา"
                        value={leaveForm.sdate}
                        onChange={(newValue) =>
                          setLeaveForm((prev) => ({
                            ...prev,
                            sdate: newValue,
                          }))
                        }
                        format="MM/DD/YYYY"
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DatePicker
                        label="วันสิ้นสุดการลา"
                        value={leaveForm.edate}
                        onChange={(newValue) =>
                          setLeaveForm((prev) => ({
                            ...prev,
                            edate: newValue,
                          }))
                        }
                        format="MM/DD/YYYY"
                        minDate={leaveForm.sdate ?? undefined}
                        slotProps={{
                          textField: {
                            error: Boolean(
                              leaveForm.edate &&
                                leaveForm.sdate &&
                                leaveForm.edate.isBefore(leaveForm.sdate)
                            ),
                            helperText:
                              leaveForm.edate &&
                              leaveForm.sdate &&
                              leaveForm.edate.isBefore(leaveForm.sdate)
                                ? "วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น"
                                : "",
                            fullWidth: true,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* ประเภทการลาและช่วงเวลา */}
                <Box
                  sx={{
                    padding: 2,
                    border: 1,
                    borderColor: "#ccc",
                    borderRadius: 2,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <FormLabel sx={{ fontSize: "1rem", marginBottom: 1 }}>
                          ประเภทการลา
                        </FormLabel>
                        <ToggleButtonGroup
                          value={leaveForm.leaveType}
                          exclusive
                          onChange={(event, newValue) => {
                            if (newValue !== null) {
                              setLeaveForm((prev) => ({
                                ...prev,
                                leaveType: newValue,
                              }));
                            }
                          }}
                          fullWidth
                        >
                          <ToggleButton value={1}>ลาพักร้อน</ToggleButton>
                          <ToggleButton value={2}>ลาป่วย</ToggleButton>
                          <ToggleButton value={3}>ลากิจ</ToggleButton>
                        </ToggleButtonGroup>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <FormLabel sx={{ fontSize: "1rem", marginBottom: 1 }}>
                          ช่วงเวลา
                        </FormLabel>
                        <ToggleButtonGroup
                          value={leaveForm.leavePeriod}
                          exclusive
                          onChange={(event, newValue) => {
                            if (newValue !== null) {
                              setLeaveForm((prev) => ({
                                ...prev,
                                leavePeriod: newValue,
                              }));
                            }
                          }}
                          fullWidth
                        >
                          <ToggleButton
                            value={1}
                            disabled={
                              !leaveForm.sdate?.isSame(leaveForm.edate, "day")
                            }
                          >
                            ลาเช้า
                          </ToggleButton>
                          <ToggleButton
                            value={2}
                            disabled={
                              !leaveForm.sdate?.isSame(leaveForm.edate, "day")
                            }
                          >
                            ลาบ่าย
                          </ToggleButton>
                          <ToggleButton value={3}>ทั้งวัน</ToggleButton>
                        </ToggleButtonGroup>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>

                {/* เหตุผล */}
                <TextField
                  label="เหตุผลการลา"
                  multiline
                  rows={4}
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  fullWidth
                />
              </Box>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!!(edate && sdate && edate.isBefore(sdate))}
            >
              ส่ง
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog edit */}
        <Dialog
          open={openDialog2}
          onClose={() => setOpenDialog2(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>แก้ไขใบลางาน</DialogTitle>
          <DialogContent dividers>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* วันที่ลา */}
                <Box
                  sx={{
                    padding: 2,
                    border: 1,
                    borderColor: "#ccc",
                    borderRadius: 2,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DatePicker
                        label="วันเริ่มลา"
                        value={editLeaveForm.sdate}
                        onChange={(newValue) =>
                          setEditLeaveForm((prev) => ({
                            ...prev,
                            sdate: newValue,
                          }))
                        }
                        format="MM/DD/YYYY"
                        slotProps={{ textField: { fullWidth: true } }}
                        disabled={profile?.id != editLeaveForm.userId}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DatePicker
                        label="วันสิ้นสุดการลา"
                        value={editLeaveForm.edate}
                        onChange={(newValue) =>
                          setEditLeaveForm((prev) => ({
                            ...prev,
                            edate: newValue,
                          }))
                        }
                        format="MM/DD/YYYY"
                        minDate={editLeaveForm.sdate ?? undefined}
                        slotProps={{
                          textField: {
                            error: Boolean(
                              editLeaveForm.edate &&
                                editLeaveForm.sdate &&
                                editLeaveForm.edate.isBefore(
                                  editLeaveForm.sdate
                                )
                            ),
                            helperText:
                              editLeaveForm.edate &&
                              editLeaveForm.sdate &&
                              editLeaveForm.edate.isBefore(editLeaveForm.sdate)
                                ? "วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น"
                                : "",
                            fullWidth: true,
                          },
                        }}
                        disabled={profile?.id != editLeaveForm.userId}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* ประเภทการลาและช่วงเวลา */}
                <Box
                  sx={{
                    padding: 2,
                    border: 1,
                    borderColor: "#ccc",
                    borderRadius: 2,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <FormLabel sx={{ fontSize: "1rem", marginBottom: 1 }}>
                          ประเภทการลา
                        </FormLabel>
                        <ToggleButtonGroup
                          value={editLeaveForm.leaveType}
                          exclusive
                          onChange={(event, newValue) => {
                            if (newValue !== null) {
                              setEditLeaveForm((prev) => ({
                                ...prev,
                                leaveType: newValue,
                              }));
                            }
                          }}
                          fullWidth
                          disabled={profile?.id != editLeaveForm.userId}
                        >
                          <ToggleButton value="ลาพักร้อน">
                            ลาพักร้อน
                          </ToggleButton>
                          <ToggleButton value="ลาป่วย">ลาป่วย</ToggleButton>
                          <ToggleButton value="ลากิจ">ลากิจ</ToggleButton>
                        </ToggleButtonGroup>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <FormLabel sx={{ fontSize: "1rem", marginBottom: 1 }}>
                          ช่วงเวลา
                        </FormLabel>
                        <ToggleButtonGroup
                          value={editLeaveForm.leavePeriod}
                          exclusive
                          onChange={(event, newValue) => {
                            if (newValue !== null) {
                              setEditLeaveForm((prev) => ({
                                ...prev,
                                leavePeriod: newValue,
                              }));
                            }
                          }}
                          fullWidth
                          disabled={profile?.id != editLeaveForm.userId}
                        >
                          <ToggleButton
                            value="เช้า"
                            disabled={
                              !editLeaveForm.sdate?.isSame(
                                editLeaveForm.edate,
                                "day"
                              )
                            }
                          >
                            ลาเช้า
                          </ToggleButton>
                          <ToggleButton
                            value="บ่าย"
                            disabled={
                              !editLeaveForm.sdate?.isSame(
                                editLeaveForm.edate,
                                "day"
                              )
                            }
                          >
                            ลาบ่าย
                          </ToggleButton>
                          <ToggleButton value="ทั้งวัน">ทั้งวัน</ToggleButton>
                        </ToggleButtonGroup>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>

                {/* เหตุผล */}
                <TextField
                  label="เหตุผลการลา"
                  multiline
                  rows={4}
                  value={editLeaveForm.reason}
                  onChange={(e) =>
                    setEditLeaveForm((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  fullWidth
                  disabled={profile?.id != editLeaveForm.userId}
                />
              </Box>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog2(false)}>ยกเลิก</Button>
            <Button
              variant="contained"
              //onClick={handleSubmit}
              disabled={
                !!(edate && sdate && edate.isBefore(sdate)) ||
                profile?.id !== editLeaveForm.userId
              }
            >
              แก้ไข
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default Absent;
