// Function to get the cell range in format like A1, B1, ..., Z1, AA1, AB1, etc.
export const getCellRange = (rowIndex: number, colIndex: number): string => {
  const column = getColumnLetter(colIndex); // Get the column letter for the current index
  return `${column}${rowIndex + 1}`; // Return the cell in format like A1, B1, C1, ..., AA1, AB1, etc.
};

// Helper function to convert column index to letter (supports multi-letter columns)
export const getColumnLetter = (colIndex: number): string => {
  let columnName = "";
  while (colIndex >= 0) {
    columnName = String.fromCharCode((colIndex % 26) + 65) + columnName; // Convert number to letter
    colIndex = Math.floor(colIndex / 26) - 1; // Move to the next digit in base-26
  }
  return columnName;
};
