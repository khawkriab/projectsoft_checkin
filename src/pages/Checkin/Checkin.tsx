import React, { useEffect, useState } from "react";

import dayjs, { Dayjs } from "dayjs";

import "dayjs/locale/th";

import Box from "@mui/material/Box";
import { SelectChangeEvent } from "@mui/material/Select";

import {
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
  Typography,
} from "@mui/material";
import { checkInData } from "./mockData";
dayjs.locale("th");
interface SheetData {
  range: string;
  majorDimension: string;
  values: string[][];
}
type UserCheckIn = {
  name: string;
  checkInTime: string;
  lateTime: number;
  remark: string;
  status: string;
};

type DataCheckin = {
  date: string;
  holidayFlag: number;
  holidayDescription: string;
  xxxFlag: number;
  userCheckIn: UserCheckIn[];
};

function CustomTableCell({ children, ...arg }: TableCellProps) {
  return (
    <TableCell {...arg} sx={{ borderLeft: "1px solid #dddddd", ...arg.sx }}>
      {children}
    </TableCell>
  );
}

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
  const [loading, setLoading] = useState<boolean>(true);
  const [dataCheckin, setDataCheckin] = useState<DataCheckin[]>(checkInData);
  const [reason, setReason] = useState<string>();

  const [value, setValue] = React.useState<Dayjs | null>(dayjs());
  const [sdate, setsDate] = useState<Dayjs | null>(dayjs());
  //console.log("sdate:", sdate);
  const [edate, seteDate] = useState<Dayjs | null>(dayjs());
  //console.log("edate:", edate);

  useEffect(() => {
    const fetchUsers = async () => {
      const payload = {
        mount: dayjs().month() + 1,
        year: dayjs().year(),
      };
      try {
        const response = await fetch(
          "http://192.168.31.165:8000/checkin/getCheckIn",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        const data: {
          checkInData: DataCheckin[];
          mount: number;
          mountDescription: number;
          year: number;
        } = await response.json();
        console.log("data from backend :", data);
        //setDataCheckin(data.checkInData);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Box
        //B1
        sx={{
          display: "flex",
          width: "100%",

          //border: 1,
          //borderColor: "#1300ff",
          justifyContent: "center",
        }}
      >
        <Box
          //B2
          sx={{
            width: "100%",

            //border: 1,
            //borderColor: "#00f0ff",
          }}
        >
          <Box
            //B3
            sx={{ maxWidth: 800 }}
            marginBottom={3}
          >
            <Grid
              container
              rowSpacing={4}
              columnSpacing={1}
              alignItems="center"
            >
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h4" sx={{ whiteSpace: "pre-line" }}>
                  {`This Day: ${value?.format("DD-MM")}\nTime : ${value?.format(
                    "HH:mm"
                  )}`}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Button variant="contained" color="primary" fullWidth>
                  เช็คอินเข้างาน
                </Button>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="เหตุผลที่ work from home"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={!reason}
                  fullWidth
                >
                  เช็คอิน work from home
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Box
          //B4
          >
            <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <CustomTableCellHeader>ชื่อพนักงาน</CustomTableCellHeader>
                    {dataCheckin[0].userCheckIn.map((item) => (
                      <CustomTableCellHeader colSpan={2}>
                        {item.name}{" "}
                      </CustomTableCellHeader>
                    ))}
                  </TableRow>
                  <TableRow>
                    <CustomTableCellHeader>วันที่</CustomTableCellHeader>
                    {dataCheckin[0].userCheckIn.map((item) => (
                      <>
                        <CustomTableCellHeader>
                          เวลาเข้างาน
                        </CustomTableCellHeader>
                        <CustomTableCellHeader>สถานะ</CustomTableCellHeader>
                      </>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataCheckin.map((data, index) => (
                    <TableRow key={data.date}>
                      <CustomTableCell>{data.date}</CustomTableCell>
                      {data.userCheckIn.map((user) => (
                        <>
                          <CustomTableCell>{user.checkInTime}</CustomTableCell>
                          <CustomTableCell>{user.remark}</CustomTableCell>
                        </>
                      ))}
                    </TableRow>
                  ))}
                  <CustomTableCell></CustomTableCell>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>

      {/* <div>
        <h1>
          <Button variant="contained" color="primary" sx={{ marginLeft: 2 }}>
            ....
          </Button>
        </h1>
        <Box sx={{ padding: 4 }}>
          <Grid>
            <Button variant="contained" color="primary">
              primary
            </Button>
          </Grid>
          <Grid>
            <Button variant="contained" color="secondary" size="large">
              secondary
            </Button>
          </Grid>
          <Grid>
            <Button variant="outlined" color="primary" size="large">
              primary
            </Button>
          </Grid>
          <Grid>
            <Button variant="outlined" color="secondary" size="large">
              secondary
            </Button>
          </Grid>
        </Box>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
          <Box display="flex" gap={2} alignItems="center">
            <DatePicker
              label="First date"
              value={sdate}
              onChange={(newValue) => setsDate(newValue)}
            />
            <DatePicker
              label="Last Date"
              value={edate}
              onChange={(newValue) => seteDate(newValue)}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="employee-select-label">Employee</InputLabel>
              <Select
                labelId="employee-select-label"
                id="employee-select"
                multiple
                value={personName}
                onChange={handleChangeMultiple}
                onClose={() => setOpenDrop(false)}
                onOpen={() => setOpenDrop(true)}
                label="Employee"
                renderValue={(selected) => (selected as string[]).join(", ")}
              >
                {employeeList.map((name: string) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </LocalizationProvider>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <CustomTableCellHeader>ชื่อพนักงาน</CustomTableCellHeader>
                {dataCheckin[0].userCheckIn.map((item) => (
                  <CustomTableCellHeader colSpan={2}>
                    {item.name}{" "}
                  </CustomTableCellHeader>
                ))}
              </TableRow>
              <TableRow>
                <CustomTableCellHeader>วันที่</CustomTableCellHeader>
                {dataCheckin[0].userCheckIn.map((item) => (
                  <>
                    <CustomTableCellHeader>เวลาเข้างาน</CustomTableCellHeader>
                    <CustomTableCellHeader>สถานะ</CustomTableCellHeader>
                  </>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dataCheckin.map((data, index) => (
                <TableRow key={data.date}>
                  <CustomTableCell>{data.date}</CustomTableCell>
                  {data.userCheckIn.map((user) => (
                    <>
                      <CustomTableCell>{user.checkInTime}</CustomTableCell>
                      <CustomTableCell>{user.status}</CustomTableCell>
                    </>
                  ))}
                </TableRow>
              ))}
              <CustomTableCell></CustomTableCell>
            </TableBody>
          </Table>
        </TableContainer>
      </div> */}
    </>
  );
}

export default Checkin;
