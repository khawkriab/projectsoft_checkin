import {
  Grid,
  Box,
  Button,
  TableCell,
  Typography,
  Stack,
  Divider,
} from "@mui/material";

import { GoogleLoginContextProps } from "components/GoogleLoginProvider/GoogleLoginProvider";
import dayjs from "dayjs";
import { CheckInData, UserCheckIn } from "pages/Checkin/Checkin";
import { Link } from "react-router-dom";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
interface Props {
  date: string;
  user: UserCheckIn;
  handleApprove: (checkinID: string | null, status: number) => void;
  roleId: GoogleLoginContextProps["roleId"];
}
const leaveTypeDescription = {
  1: "ลาพักร้อน",
  2: "ลาป่วย",
  3: "ลากิจ",
};

const leaveTimeDescription = {
  1: "ลาเช้า",
  2: "ลาบ่าย",
  3: "ลาทั้งวัน",
};

const UserApprovalCell = ({ date, user, handleApprove, roleId }: Props) => {
  const isAdmin = roleId === 1;
  const isUser = roleId === 3;

  if (user.checkinTime === null) {
    return null;
  }

  return (
    <Box>
      {/* เข้างาน */}
      {user.checkInData && (
        <Box>
          <Typography variant="subtitle2">
            {"เข้างาน: "}
            {user.checkInData?.where} {"- "}
            {user?.status}
          </Typography>
          {user.checkInData?.remark && (
            <Typography variant="subtitle2">
              {/* remark */}
              {"เหตุผล: "}
              {user.checkInData?.remark}
            </Typography>
          )}
          {isAdmin && user.checkInData?.checkInStatus === 99 && (
            <Stack direction="row" spacing={2}>
              {/* button */}
              <Button size="small" variant="contained" color="success">
                Approve
              </Button>
              <Button size="small" variant="contained" color="error">
                Reject
              </Button>
              <Button size="small" variant="contained" color="warning">
                Location
              </Button>
            </Stack>
          )}
        </Box>
      )}

      {user.checkInData && user.leaveData && (
        <Divider
          orientation="horizontal"
          sx={{ borderColor: "gray", margin: 1 }}
        />
      )}

      {/* ลา */}
      {user.leaveData && (
        <Box>
          <Typography variant="subtitle2">
            {"ลา: "}
            {leaveTypeDescription[user.leaveData.leaveTypeId]} {"-"}
            {leaveTimeDescription[user.leaveData.leaveTimeId]}
          </Typography>
          <Typography variant="subtitle2">
            {/* remark */}
            {"เหตุผล: "}
            {user.leaveData?.remark}
          </Typography>
          {isAdmin && user.leaveData?.leaveStatus === 99 && (
            <Stack direction="row" spacing={2}>
              {/* button */}
              <Button size="small" variant="contained" color="success">
                Approve
              </Button>
              <Button size="small" variant="contained" color="error">
                Reject
              </Button>
              <Button size="small" variant="contained" color="warning">
                Location
              </Button>
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );

  // สำหรับ role อื่นๆ (เช่น staff)

  // if (0) {
  //   <Box>
  //     <Box textAlign="center">
  //       {"On-site"}
  //       <br />
  //       {user.status}
  //     </Box>
  //     <Box display="flex" gap={1}>
  //       <Button
  //         variant="contained"
  //         size="small"
  //         sx={{
  //           backgroundColor: "#ff5c5c",
  //           color: "#fff",
  //           "&:hover": { backgroundColor: "#e04848" },
  //           zIndex: 2,
  //         }}
  //         onClick={() => handleApprove(user.checkInData.checkInId, 0)}
  //       >
  //         Reject
  //       </Button>
  //       <Button
  //         variant="contained"
  //         size="small"
  //         sx={{
  //           backgroundColor: "#77f277",
  //           color: "#fff",
  //           "&:hover": { backgroundColor: "#49d649" },
  //           zIndex: 2,
  //         }}
  //         onClick={() => handleApprove(user.checkInData.checkInId, 1)}
  //       >
  //         Approve
  //       </Button>

  //       {dayjs().isSame(dayjs(date, "DD/MM/YYYY"), "day") && (
  //         <Button
  //           variant="outlined"
  //           size="small"
  //           component={Link}
  //           to={`/Map?userId=${user.userId}`}
  //         >
  //           Map
  //         </Button>
  //       )}
  //     </Box>
  //   </Box>;
  // }

  // Admin - Pending (approve/reject)
  // if (isAdmin && user.approvedStatus === 99) {
  //   const lateInfo = dayjs(user.checkinTime, "HH:mm:ss").isAfter(
  //     dayjs("08:00:00", "HH:mm:ss")
  //   )
  //     ? `Late ${user.lateTime} HR`
  //     : "On time";

  //   const statusLabel =
  //     user.attendanceStatus === 0
  //       ? `Onsite${user.remark ? ` : ${user.remark}` : ""}`
  //       : `WFH${user.remark ? ` : ${user.remark}` : ""}`;

  //   return (
  //     <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
  //       <Box textAlign="center">
  //         {statusLabel}
  //         <br />
  //         {lateInfo}
  //       </Box>
  //       <Box display="flex" gap={1}>
  //         <Button
  //           variant="contained"
  //           size="small"
  //           sx={{
  //             backgroundColor: "#ff5c5c",
  //             color: "#fff",
  //             "&:hover": { backgroundColor: "#e04848" },
  //           }}
  //           onClick={() => handleApprove(checkinID, 0)}
  //         >
  //           Reject
  //         </Button>
  //         <Button
  //           variant="contained"
  //           size="small"
  //           sx={{
  //             backgroundColor: "#77f277",
  //             color: "#fff",
  //             "&:hover": { backgroundColor: "#49d649" },
  //           }}
  //           onClick={() => handleApprove(checkinID, 1)}
  //         >
  //           Approve
  //         </Button>

  //         {dayjs().isSame(dayjs(date, "DD/MM/YYYY"), "day") && (
  //           <Button
  //             variant="outlined"
  //             size="small"
  //             component={Link}
  //             to={`/Map?userId=${user.userId}`}
  //           >
  //             Map
  //           </Button>
  //         )}
  //       </Box>
  //     </Box>
  //   );
  // }

  // User หรือ Admin (Approved/Rejected)
  // if (isUser || isAdmin) {
  //   const lateInfo = dayjs(user.checkinTime, "HH:mm:ss").isBefore(
  //     dayjs("08:00:00", "HH:mm:ss")
  //   )
  //     ? user.lateTime
  //     : `Late ${user.lateTime} HR`;

  //   const statusLabel =
  //     user.attendanceStatus === 0
  //       ? `Onsite${user.remark ? ` : ${user.remark}` : ""}`
  //       : `WFH${user.remark ? ` : ${user.remark}` : ""}`;

  //   return (
  //     <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
  //       <Box textAlign="center">
  //         {statusLabel}
  //         <br />
  //         {lateInfo}
  //       </Box>
  //     </Box>
  //   );
  // }
};

export default UserApprovalCell;
