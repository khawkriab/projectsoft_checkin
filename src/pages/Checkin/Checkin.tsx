import axios from "axios";
import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import "dayjs/locale/th";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
dayjs.locale("th");
interface SheetData {
  range: string;
  majorDimension: string;
  values: string[][];
}

type ProfileData = {
  id: string;
  fullName: string;
  profileURL: string;
  email: string;
};

function Checkin() {
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [dateList, setDateList] = useState<string[]>([]);
  const [employeeList, setEmployeeList] = useState<string[]>([]);
  const [personName, setPersonName] = React.useState<string[]>([]);
  const [openDrop, setOpenDrop] = useState(false);
  const [profile, setProfile] = useState<ProfileData>();
  const [updateSheetsData, setUpdateSheetsData] = useState<{
    row: string;
    column: string;
    time?: string;
    mark?: string;
  }>({ row: "3", column: "1", mark: "" });

  const [sdate, setsDate] = useState<Dayjs | null>(dayjs());
  //console.log("sdate:", sdate);
  const [edate, seteDate] = useState<Dayjs | null>(dayjs());
  //console.log("edate:", edate);

  const handleChangeMultiple = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setPersonName(typeof value === "string" ? value.split(",") : value);
    setOpenDrop(false);
  };

  const [value, setValue] = React.useState<Dayjs | null>(dayjs("2022-04-17"));

  // Function to get the cell range in format like A1, B1, ..., Z1, AA1, AB1, etc.
  const getCellRange = (rowIndex: number, colIndex: number): string => {
    const column = getColumnLetter(colIndex); // Get the column letter for the current index
    return `${column}${rowIndex + 1}`; // Return the cell in format like A1, B1, C1, ..., AA1, AB1, etc.
  };

  const filteredRows = sheetData.slice(2).filter((row) => {
    const dateStr = row[0]; // วันที่ใน format 'DD-MM-YYYY'
    const rowDate = dayjs(dateStr, "DD-MM-YYYY");

    return (
      (rowDate.isAfter(sdate, "day") || rowDate.isSame(sdate, "day")) &&
      (rowDate.isBefore(edate, "day") || rowDate.isSame(edate, "day"))
    );
  });

  // Helper function to convert column index to letter (supports multi-letter columns)
  const getColumnLetter = (colIndex: number): string => {
    let columnName = "";
    while (colIndex >= 0) {
      columnName = String.fromCharCode((colIndex % 26) + 65) + columnName; // Convert number to letter
      colIndex = Math.floor(colIndex / 26) - 1; // Move to the next digit in base-26
    }
    return columnName;
  };

  const initClient = () => {
    const clientId =
      "617287579060-66r4kae3sergkb7bv933ipkekpg1l8a6.apps.googleusercontent.com";
    const apiKey = "AIzaSyC5wYRXYMuUGQGchOqgtreNx2y3bf2eTic";
    gapi.client
      .init({
        apiKey: apiKey,
        clientId: clientId,
        discoveryDocs: [
          "https://sheets.googleapis.com/$discovery/rest?version=v4",
        ],
        scope: "https://www.googleapis.com/auth/spreadsheets",
      })
      .then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        console.log("authInstance:", authInstance.currentUser.get());
        const googleUser = authInstance.currentUser.get();
        console.log("googleUser:", googleUser.getBasicProfile());

        const profile = googleUser.getBasicProfile();

        console.log("ID: " + profile.getId()); // Google's unique ID for the user
        console.log("Full Name: " + profile.getName()); // Full name
        console.log("Given Name: " + profile.getGivenName()); // First name
        console.log("Family Name: " + profile.getFamilyName()); // Last name
        console.log("Image URL: " + profile.getImageUrl()); // Profile picture
        console.log("Email: " + profile.getEmail()); // Email address

        setIsSignedIn(authInstance.isSignedIn.get());
        console.log(
          "authInstance.isSignedIn.get():",
          authInstance.isSignedIn.get()
        );

        authInstance.isSignedIn.listen(setIsSignedIn);
        setAuthLoaded(true);
      })
      .catch((error: any) => {
        console.error("Error initializing Google API client:", error);
      });
  };

  const handleSignIn = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  const handleSignOut = () => {
    gapi.auth2.getAuthInstance().signOut();
  };

  const updateSheet = () => {
    if (isSignedIn) {
      const columnDate = getColumnLetter(Number(updateSheetsData.column));
      const columnMark = getColumnLetter(Number(updateSheetsData.column) + 2);
      const params = {
        spreadsheetId: process.env.REACT_APP_SHEETS_ID,
        // range: `April!${updateSheetsData.column}${updateSheetsData.row}`, // Define the range you want to update
        // values: [[updateSheetsData.time]],
        resource: {
          data: [
            {
              range: `April!${columnDate}${updateSheetsData.row}`,
              values: [[updateSheetsData.time]],
            },
            {
              range: `April!${columnMark}${updateSheetsData.row}`,
              values: [[updateSheetsData.mark]],
            },
          ],
          valueInputOption: "USER_ENTERED",
        },
      };

      const request =
        gapi.client.sheets.spreadsheets.values.batchUpdate(params);
      request.then(
        (response: any) => {
          getSheets();

          alert("Sheet updated successfully");
        },
        (error: any) => {
          console.error("Error updating the sheet", error);
          alert("Error updating the sheet");
        }
      );
    }
  };

  const onChangeData = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setUpdateSheetsData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getSheets = async () => {
    // API URL and your API key
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.REACT_APP_SHEETS_ID}/values/April?key=${process.env.REACT_APP_API_KEY}`;

    // Fetch data from Google Sheets
    axios
      .get<SheetData>(apiUrl)
      .then((response) => {
        const data = response.data.values;
        console.log("data:", data);
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
        //console.log("currentDate:", currentDate);
        const indexOfList = dateListSheets.findIndex((f) => f === currentDate);
        const rowSelect = String(indexOfList + 3);
        //console.log("selectDate:", rowSelect);
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
    gapi.load("client:auth2", initClient);
    getSheets();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Projectsoft Check-In :</h1>

      {/* <div className="form-update">
        <div className="form-group">
          {!authLoaded ? (
            <div>Loading...</div>
          ) : isSignedIn ? (
            <div>
              <div className="form-group d-flex">
                <p className="mt-auto mb-0 me-3">You are signed in!</p>
                <button
                  className="btn btn-danger btn-sm d-inline-block"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>

              <div style={{ display: "flex" }}>
                <div className="form-group">
                  <label className="form-label">วันที่</label>
                  <select
                    disabled
                    className="form-select"
                    name="row"
                    value={updateSheetsData.row}
                    onChange={onChangeData}
                  >
                    <option>select</option>
                    {dateList.map((date, index) => (
                      <option key={index} value={String(index + 3)}>
                        {date} ({getCellRange(index + 2, 0)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">พนักงาน</label>
                  <select
                    className="form-select"
                    name="column"
                    value={updateSheetsData.column}
                    onChange={onChangeData}
                  >
                    <option>select</option>
                    {employeeList.map((employee, index) => (
                      <option key={index} value={String(index * 3 + 1)}>
                        {employee} ({getCellRange(0, index * 3 + 1)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">เวลา</label>
                  <input
                    className="form-control"
                    type="time"
                    name="time"
                    value={updateSheetsData.time}
                    onChange={onChangeData}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">หมายเหตุ</label>
                  <input
                    className="form-control"
                    name="mark"
                    value={updateSheetsData.mark}
                    onChange={onChangeData}
                  />
                </div>
                <div className="form-group" style={{ display: "flex" }}>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: "auto" }}
                    onClick={updateSheet}
                  >
                    update
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <button className="btn btn-primary" onClick={handleSignIn}>
                Sign In to Google
              </button>
            </div>
          )}
        </div>
      </div> */}
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
                {sheetData
                  .slice(2)
                  .filter((row) => {
                    const rowDate = dayjs(row[0], "DD-MM-YYYY");
                    return (
                      (rowDate.isAfter(sdate, "day") ||
                        rowDate.isSame(sdate, "day")) &&
                      (rowDate.isBefore(edate, "day") ||
                        rowDate.isSame(edate, "day"))
                    );
                  })
                  .map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx}>{cell}</td>
                      ))}
                    </tr>
                  ))}

                {/* filter by date */}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkin;
