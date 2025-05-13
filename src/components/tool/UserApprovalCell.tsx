import { Box, Button, TableCell } from "@mui/material";

interface Props {
  user: any;
  handleApprove: (checkinID: string | null, status: number) => void;
  roleid: number | null;
  checkinID: string | null;
}

const UserApprovalCell = ({
  user,
  handleApprove,
  roleid,
  checkinID,
}: Props) => {
  const getStatusBox = () => {
    let bgcolor = "#42a5f5";
    let label = "Unknown";

    switch (user.approvedStatus) {
      case "Rejected":
        bgcolor = "#ff5c5c";
        label = "Rejected";
        break;
      case "Accepted":
        bgcolor = "#77f277";
        label = "Approved";
        break;
      case "Pending":
        bgcolor = "#fbc02d";
        label = "Pending";
        break;
    }

    return (
      <Box
        mt={1}
        width={80}
        height={30}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="15px"
        mx="auto"
        bgcolor={bgcolor}
        color="#fff"
        fontSize="0.75rem"
        fontWeight="bold"
      >
        {label}
      </Box>
    );
  };

  const isPendingAndNoId = user.approvedStatus === "Pending" && roleid === 1;

  return (
    <TableCell
      align="center"
      sx={{
        fontWeight: 500,
        fontSize: "0.95rem",
        borderRight: "1px solid #eee",
        minWidth: "190px",
      }}
    >
      {isPendingAndNoId ? (
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <Box textAlign="center">
            <Box>{user.reason}</Box>
            {["ลาป่วย", "ลากิจ", "ลางาน"].includes(user.reason) && (
              <Box>{user.remark}</Box>
            )}
          </Box>

          <Box display="flex" justifyContent="center" gap={1} mt={1}>
            <Button
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "#ffa53d",
                color: "#fff",
                "&:hover": { backgroundColor: "#e6952e" },
              }}
              onClick={() => handleApprove(checkinID, 0)}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "#77f277",
                color: "#fff",
                "&:hover": { backgroundColor: "#49d649" },
              }}
              onClick={() => handleApprove(checkinID, 1)}
            >
              Accept
            </Button>
          </Box>
        </Box>
      ) : (
        getStatusBox()
      )}
    </TableCell>
  );
};

export default UserApprovalCell;
