import { Box, useTheme } from "@mui/material";
import { tokens } from "../theme/themes";
import { Gauge } from "@mui/x-charts";

const ProgressCircle = ({ progress = 0, size = "110" }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const angle = progress * 360;
  
  return (
    <Box
      sx={{
        background: `radial-gradient(${colors.primary[400]} 55%, transparent 56%),
            conic-gradient(transparent 0deg ${angle}deg, ${colors.grey[700]} ${angle}deg 360deg),
            ${colors.greenAccent[500]}`,
        borderRadius: "100%",
        width: `${size}px`,
        height: `${size}px`,
    }}
    >
    {/*<Gauge width={100} height={100} value={angle} valueMax={100} 
      text={({ value }) => `${!value?'':value.toFixed(0)} %`}
  />*/}
    </Box>
  );
};

export default ProgressCircle;
