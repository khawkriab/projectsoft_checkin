import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Typography from "@mui/material/Typography";

dayjs.locale("th");

const TimeCurrent = () => {
  const [value, setValue] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(dayjs());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Typography variant="h5" sx={{ whiteSpace: "pre-line" }}>
      {`To Day: ${value.format("DD MMMM YYYY")} ${value.format("HH:mm:ss")}`}
    </Typography>
  );
};

export default TimeCurrent;
