import axios from "axios";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useGoogleLogin } from "components/GoogleLoginProvider";
import { getCellRange, getColumnLetter } from "helper/getColumnLetter";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select/SelectInput";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

interface SheetData {
  range: string;
  majorDimension: string;
  values: string[][];
}

function GoogleSheetData() {
  const { auth2, authLoading, isSignedIn } = useGoogleLogin();
  //
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState(false);
  const [dateList, setDateList] = useState<string[]>([]);
  const [employeeList, setEmployeeList] = useState<string[]>([]);
  const [updateSheetsData, setUpdateSheetsData] = useState<{
    row: string;
    column: string;
    time?: string;
    mark?: string;
  }>({ row: "3", column: "1", mark: "" });

  // const initClient = () => {
  //   gapi.client
  //     .init({
  //       apiKey: process.env.REACT_APP_API_KEY,
  //       clientId: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
  //       discoveryDocs: [
  //         "https://sheets.googleapis.com/$discovery/rest?version=v4",
  //       ],
  //       scope: "https://www.googleapis.com/auth/spreadsheets",
  //     })
  //     .then(() => {
  //       const authInstance = gapi.auth2.getAuthInstance();
  //       setIsSignedIn(authInstance.isSignedIn.get());

  //       authInstance.isSignedIn.listen(setIsSignedIn);
  //       setAuthLoaded(true);
  //     })
  //     .catch((error: any) => {
  //       console.error("Error initializing Google API client:", error);
  //     });
  // };

  // const handleSignIn = () => {
  //   gapi.auth2.getAuthInstance().signIn();
  // };

  // const handleSignOut = () => {
  //   gapi.auth2.getAuthInstance().signOut();
  // };

  const updateSheet = async () => {
    if (isSignedIn && auth2) {
      const user = auth2.currentUser.get();
      const token = user.getAuthResponse().access_token;
      const spreadsheetId = process.env.REACT_APP_SHEETS_ID;
      const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
      const columnDate = getColumnLetter(Number(updateSheetsData.column));
      const columnMark = getColumnLetter(Number(updateSheetsData.column) + 2);
      console.log("updateSheetsData:", updateSheetsData);
      const requestBody = {
        valueInputOption: "USER_ENTERED", // or "RAW"
        data: [
          {
            range: `May!${columnDate}${updateSheetsData.row}`,
            values: [[updateSheetsData.time]],
          },
          {
            range: `May!${columnMark}${updateSheetsData.row}`,
            values: [[updateSheetsData.mark]],
          },
        ],
      };

      setUpdating(true);
      const response = await axios(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify(requestBody),
      });

      if (response.status === 200) {
        await getSheets();

        alert("Sheet updated successfully");
      } else {
        alert("Error updating the sheet");
      }

      setUpdating(false);
    }
  };

  const onChangeData = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
    setUpdateSheetsData((prev) => ({
      ...prev,
      [e.target.name ?? ""]: e.target.value,
    }));
  };

  const getSheets = async () => {
    // API URL and your API key
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.REACT_APP_SHEETS_ID}/values/May?key=${process.env.REACT_APP_API_KEY}`;

    // Fetch data from Google Sheets
    axios
      .get<SheetData>(apiUrl)
      .then((response) => {
        const data = response.data.values;
        const maxLength = data[1].length;
        const normalizedData = data.map((row) => {
          const rowCopy = [...row];
          // Add empty strings for missing columns to match the first row length
          while (rowCopy.length < maxLength) {
            rowCopy.push("");
          }
          return rowCopy;
        });
        setSheetData(normalizedData); // Set the sheet data
        const dateListSheets = normalizedData.slice(2).map((row) => row[0]);
        const currentDate = dayjs().format("DD-MM-YYYY");
        console.log("currentDate:", currentDate);
        const indexOfList = dateListSheets.findIndex((f) => f === currentDate);
        const rowSelect = String(indexOfList + 3);
        console.log("selectDate:", rowSelect);
        setDateList([...dateListSheets]);
        setUpdateSheetsData((prev) => ({ ...prev, row: rowSelect }));

        // set employee
        let arr: string[] = [];
        normalizedData[0].slice(1).forEach((col) => {
          if (!col) return;

          arr.push(col);
        });

        setEmployeeList([...arr]);
        setLoading(false); // Set loading to false
      })
      .catch((err) => {
        console.error("err:", err);
        // setError("Error fetching data from Google Sheets");
        setLoading(false);
      });
  };

  useEffect(() => {
    // gapi.load("client:auth2", initClient);
    getSheets();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* <h1>Projectsoft Check-In :)</h1> */}
      <div className="form-update">
        <div className="form-group">
          {authLoading ? (
            <div>Loading...</div>
          ) : (
            isSignedIn && (
              // <div style={{ display: "flex" }}>
              //   <div className="form-group">
              //     <label className="form-label">วันที่</label>
              //     <select
              //       disabled
              //       className="form-select"
              //       name="row"
              //       value={updateSheetsData.row}
              //       onChange={onChangeData}
              //     >
              //       <option>select</option>
              //       {dateList.map((date, index) => (
              //         <option key={index} value={String(index + 3)}>
              //           {date} ({getCellRange(index + 2, 0)})
              //         </option>
              //       ))}
              //     </select>
              //   </div>
              //   <div className="form-group">
              //     <label className="form-label">พนักงาน</label>
              //     <select
              //       className="form-select"
              //       name="column"
              //       value={updateSheetsData.column}
              //       onChange={onChangeData}
              //     >
              //       <option>select</option>
              //       {employeeList.map((employee, index) => (
              //         <option key={index} value={String(index * 3 + 1)}>
              //           {employee} ({getCellRange(0, index * 3 + 1)})
              //         </option>
              //       ))}
              //     </select>
              //   </div>
              //   <div className="form-group">
              //     <label className="form-label">เวลา</label>
              //     <input
              //       className="form-control"
              //       type="time"
              //       name="time"
              //       value={updateSheetsData.time}
              //       onChange={onChangeData}
              //     />
              //   </div>
              //   <div className="form-group">
              //     <label className="form-label">หมายเหตุ</label>
              //     <input
              //       className="form-control"
              //       name="mark"
              //       value={updateSheetsData.mark}
              //       onChange={onChangeData}
              //     />
              //   </div>
              //   <div className="form-group" style={{ display: "flex" }}>
              //     <button
              //       className="btn btn-primary"
              //       style={{ marginTop: "auto" }}
              //       onClick={updateSheet}
              //     >
              //       update
              //     </button>
              //   </div>
              // </div>
              <>
                <Box
                  display="flex"
                  gap={2}
                  flexWrap="wrap"
                  alignItems={"center"}
                >
                  {/* Date (Disabled Select) */}
                  <FormControl disabled>
                    <InputLabel id="date-label">วันที่</InputLabel>
                    <Select
                      labelId="date-label"
                      name="row"
                      value={updateSheetsData.row}
                      onChange={onChangeData}
                      label="วันที่"
                    >
                      <MenuItem value="">select</MenuItem>
                      {dateList.map((date, index) => (
                        <MenuItem key={index} value={String(index + 3)}>
                          {date} ({getCellRange(index + 2, 0)})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Employee Select */}
                  <FormControl>
                    <InputLabel id="employee-label">พนักงาน</InputLabel>
                    <Select
                      labelId="employee-label"
                      name="column"
                      value={updateSheetsData.column}
                      onChange={onChangeData}
                      label="พนักงาน"
                    >
                      <MenuItem value="">select</MenuItem>
                      {employeeList.map((employee, index) => (
                        <MenuItem key={index} value={String(index * 3 + 1)}>
                          {employee} ({getCellRange(0, index * 3 + 1)})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Time Input */}
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="เวลา"
                      ampm={false}
                      timeSteps={{ minutes: 1 }}
                      slotProps={{
                        textField: {
                          name: "time",
                        },
                      }}
                      onChange={(newValue) => {
                        setUpdateSheetsData((prev) => ({
                          ...prev,
                          time: dayjs(newValue).format("HH:mm"),
                        }));
                      }}
                    />
                  </LocalizationProvider>

                  {/* Note Input */}
                  <TextField
                    name="mark"
                    label="หมายเหตุ"
                    value={updateSheetsData.mark}
                    onChange={onChangeData}
                  />

                  {/* Update Button */}
                  <Box display="flex" alignItems="flex-end">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={updateSheet}
                      loading={updating}
                    >
                      update
                    </Button>
                  </Box>
                </Box>
              </>
            )
          )}
        </div>
      </div>
      <div className="table-listing-container">
        <div className="table-listing-content">
          {!loading && (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>{sheetData[0][0]}</th>
                  {sheetData[0].length > 0 &&
                    sheetData[0]?.slice(1)?.map((col, index) => {
                      if (!col) return null;

                      return (
                        <th key={index} colSpan={3}>
                          {col}
                        </th>
                      );
                    })}
                </tr>
                <tr>
                  {sheetData[1].length > 0 &&
                    sheetData[1]?.map((col, index) => (
                      <th key={index} style={{ whiteSpace: "nowrap" }}>
                        {col}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {sheetData.slice(2).map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx}>
                        {cell}
                        {/* ({getCellRange(rowIdx + 2, cellIdx)}) */}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default GoogleSheetData;
