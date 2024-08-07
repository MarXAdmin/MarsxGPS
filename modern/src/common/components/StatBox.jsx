import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme/themes";

const StatBox = ({ title, subtitle, icon }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box width="100%" m="0 30px">
      <Box display="flex" justifyContent="space-between" >
        <Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ color: colors.grey[200] }}
          >
            {title}
          </Typography>
        </Box>
        <Box>
            {icon}
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
        <Typography variant="h6" sx={{ color: colors.greenAccent[500] }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox;
