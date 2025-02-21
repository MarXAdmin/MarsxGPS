import React, { useState } from "react";
import { Box, Button, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import dayjs from 'dayjs';

const Calendar = ({handleSubmit, dayslist = 4}) => {
  const [selectedDate, setSelectedDate] = useState(new Date()); // select day now
  const [startDate, setStartDate] = useState(new Date()); // start day
  const [anchorEl, setAnchorEl] = useState(null); // no/off manu
  const daysToShow = dayslist; // days count in list

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 4); 

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() - (daysToShow - 1) + i);
      dates.push(date);
    }
    return dates;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);

    handleSubmit({
        date,
        from: dayjs(date).startOf('day').toISOString(),
        to: dayjs(date).endOf('day').toISOString(),
      });
  };

  const handleMonthYearClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(startDate);
    newDate.setMonth(monthIndex);
    setStartDate(newDate);
    setSelectedDate(newDate);
    setAnchorEl(null); // ปิดเมนู
  };

  const handleYearSelect = (year) => {
    const newDate = new Date(startDate);
    newDate.setFullYear(year);
    setStartDate(newDate);
    setSelectedDate(newDate);
    setAnchorEl(null); // ปิดเมนู
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePrevious = () => {
    const newStartDate = new Date(startDate);
    newStartDate.setDate(startDate.getDate() - daysToShow); // เลื่อนไปยังชุดวันที่ก่อนหน้า
    setStartDate(newStartDate);
  };

  const handleNext = () => {
    const newStartDate = new Date(startDate);
    newStartDate.setDate(startDate.getDate() + daysToShow); // เลื่อนไปยังชุดวันที่ถัดไป
    setStartDate(newStartDate);
  };

  const formatDate = (date) => {
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayOfMonth = date.getDate();
    return { dayOfWeek, dayOfMonth };
  };

  return (
    <Box display="flex" alignItems="flex-start" flexDirection="column" p={2} textAlign="left">
      {/* แสดงเดือน-ปี */}
      <Button onClick={handleMonthYearClick}>
        <Typography variant="h6">
          {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </Typography>
      </Button>

      {/* เมนูเลือกเดือน-ปี */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {/* เลือกเดือน */}
        {months.map((month, index) => (
          <MenuItem key={month} onClick={() => handleMonthSelect(index)}>
            {month}
          </MenuItem>
        ))}
        <MenuItem disabled>──────────</MenuItem>
        {/* เลือกปี */}
        {years.map((year) => (
          <MenuItem key={year} onClick={() => handleYearSelect(year)}>
            {year}
          </MenuItem>
        ))}
      </Menu>

      {/* ปุ่มเลื่อนซ้าย-ขวา และปุ่มวันที่ */}
      <Box display="flex" alignItems="flex-start" gap={1} mt={1}>
        {/* ปุ่มลูกศรซ้าย */}
        <IconButton onClick={handlePrevious} sx={{padding: "10px 0px",}}>
          <ArrowBackIosNewIcon />
        </IconButton>

        {/* ปุ่มวันที่ */}
        <Box display="flex" overflow="auto" gap={1}>
          {generateDates().map((date) => {
            const { dayOfWeek, dayOfMonth } = formatDate(date);
            const isSelected = date.toDateString() === selectedDate.toDateString();

            return (
              <Button
                key={date.toDateString()}
                onClick={() => handleDateClick(date)}
                variant={isSelected ? "contained" : "outlined"}
                color={isSelected ? "warning" : "primary"}
                sx={{
                  borderRadius: "20px",
                  padding: "10px 15px",
                  minWidth: "60px",
                  flexDirection: "row", 
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: isSelected ? "white" : "text.primary",
                    fontWeight: isSelected ? "bold" : "normal",
                  }}
                >
                  {dayOfWeek}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: isSelected ? "white" : "text.primary",
                    fontWeight: isSelected ? "bold" : "normal",
                  }}
                >
                  {dayOfMonth}
                </Typography>
              </Button>
            );
          })}
        </Box>

        {/* ปุ่มลูกศรขวา */}
        <IconButton onClick={handleNext}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Calendar;
