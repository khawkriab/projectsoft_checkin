import axios from "axios";
import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import dayjs from "dayjs";

interface SheetData {
  range: string;
  majorDimension: string;
  values: string[][];
}

function GoogleSheetData() {
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [dateList, setDateList] = useState<string[]>([]);
  const [employeeList, setEmployeeList] = useState<string[]>([]);
  const [updateSheetsData, setUpdateSheetsData] = useState<{
    row: string;
    column: string;
    time?: string;
    mark?: string;
  }>({ row: "3", column: "1", mark: "" });

  // Function to get the cell range in format like A1, B1, ..., Z1, AA1, AB1, etc.
  const getCellRange = (rowIndex: number, colIndex: number): string => {
    const column = getColumnLetter(colIndex); // Get the column letter for the current index
    return `${column}${rowIndex + 1}`; // Return the cell in format like A1, B1, C1, ..., AA1, AB1, etc.
  };

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
    gapi.client
      .init({
        apiKey: process.env.REACT_APP_API_KEY,
        clientId: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
        discoveryDocs: [
          "https://sheets.googleapis.com/$discovery/rest?version=v4",
        ],
        scope: "https://www.googleapis.com/auth/spreadsheets",
      })
      .then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        setIsSignedIn(authInstance.isSignedIn.get());

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
    gapi.load("client:auth2", initClient);
    getSheets();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Projectsoft Check-In :)</h1>
      <div className="form-update">
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
