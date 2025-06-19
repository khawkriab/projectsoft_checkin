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
  //date: string;
  user: UserCheckIn;
  ApproveWork: (checkInId: string | null, status: number) => void;
  ApproveLeave: (ApproveLeave: string | null, status: number) => void;
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

const UserApprovalCell = ({
  //date,
  user,
  ApproveWork,
  ApproveLeave,
  roleId,
}: Props) => {
  const isAdmin = roleId === 1;
  const isStaff = roleId === 2;
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
          {(isAdmin || isStaff) && user.checkInData?.checkInStatus === 99 && (
            <Stack direction="row" spacing={1}>
              {/* button */}

              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => ApproveWork(user.checkInData.checkInId, 1)}
              >
                Approve
              </Button>

              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => ApproveWork(user.checkInData.checkInId, 0)}
              >
                Reject
              </Button>

              <Button
                size="small"
                variant="contained"
                color="info"
                component={Link}
                to={`/Map?userId=${user.userId}`}
              >
                Location
              </Button>
              {/* {dayjs().isSame(dayjs(date, "YYYY/MM/DD"), "day") && (
                <Button
                  size="small"
                  variant="contained"
                  color="info"
                  component={Link}
                  to={`/Map?userId=${user.userId}`}
                >
                  Location
                </Button>
              )} */}
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
          {(isAdmin || isStaff) && user.leaveData?.leaveStatus === 99 && (
            <Stack direction="row" spacing={1}>
              {/* button */}
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => ApproveLeave(user.leaveData.leaveId, 1)}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => ApproveLeave(user.leaveData.leaveId, 0)}
              >
                Reject
              </Button>

              <Button
                size="small"
                variant="contained"
                color="warning"
                component={Link}
                to={`/Map?userId=${user.userId}`}
              >
                Location
              </Button>
              {/* {dayjs().isSame(dayjs(date, "YYYY-MM-DD"), "day") && (
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  component={Link}
                  to={`/Map?userId=${user.userId}`}
                >
                  Location
                </Button>
              )} */}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
};

export default UserApprovalCell;
