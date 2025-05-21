import React, { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";

function Schedule() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button variant="contained" onClick={handleClick}>
        Schedule
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleClose}>Add Schedule</MenuItem>
        <MenuItem onClick={handleClose}>View Calendar</MenuItem>
      </Menu>
    </>
  );
}

export default Schedule;
