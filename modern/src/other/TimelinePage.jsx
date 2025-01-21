import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import {
  Typography, AppBar, Toolbar, IconButton, Box,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
//import PositionValue from '../common/components/PositionValue';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useCatch } from '../reactHelper';
import CalendarLine from '../common/components/CalendarLine';
import TimelineMap from './TimelineMap';
import LineChartAttributes from '../common/components/LineChartAttributes';
import dayjs from 'dayjs';
import { formatNumericHours } from '../common/util/formatter';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    overflow: 'auto',
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(2),
  },
}));

const TimelinePage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const server = useSelector((state) => state.session.server);
  const serverDarkMode = server?.attributes?.darkMode;

  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  //const displaybox = desktop ? 'grid' : 'column';
  const gcolgraph = desktop ? 'repeat(12, 1fr)' : 'repeat(5, 1fr)';
  //const colors = ( serverDarkMode ? "#1F2A40" : "#e0e0e0" ) // "#e0e0e0"; //"inherit"; e0e0e0 , 1F2A40
  const dayslistcalendar = desktop ? 10 : 4; 
  //const coloricon = "#3da58a";

  const { id } = useParams(); //Get Device ID Params
  const deviceId  = id;
  const [from, setFrom] = useState(dayjs().startOf('day').toISOString());
  const [to, setTo] = useState(dayjs().endOf('day').toISOString());

  const [positions, setPositions] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [expanded, setExpanded] = useState(true);

  const [enginehours, setEnginehours] = useState(0);
  const [spentfuel, setSpentfuel] = useState(0);

  useEffectAsync(async () => {
      if (deviceId) {

        //positions data for TimelineMap
        const query = new URLSearchParams({ deviceId, from, to });
        const response = await fetch(`/api/positions?${query.toString()}`);
        if (response.ok) {
          const positions = await response.json();
          setPositions(positions);
          if (positions.length) {
            setExpanded(false);
          } else {
            throw Error(t('sharedNoData'));
          }
        } else {
          throw Error(await response.text());
        }

        //route data for Line Chart Attributes 
        const response2 = await fetch(`/api/reports/route?deviceId=${deviceId}&from=${from}&to=${to}`,{
            headers: { Accept: 'application/json' },
        });
        if (response2.ok) {
            const route = await response2.json();
            setRoutes(route);
        } else {
          throw Error(await response2.text());
        }

        //Summary data 
        const sum = await fetch(`/api/reports/summary?deviceId=${deviceId}&from=${from}&to=${to}`,{
            headers: { Accept: 'application/json' },
        });
        if (sum.ok) {
          const sumdata = await sum.json();
          setEnginehours(sumdata[0].engineHours);
          setSpentfuel(sumdata[0].spentFuel);
        } else {
          throw Error(await sum.text());
        }

      }
    }, [from, to]);

  const deviceName = useSelector((state) => {
    if (deviceId) {
      const device = state.devices.items[deviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

  const handleSubmit = useCatch(async ({ date, from, to }) => {
      setFrom(from);
      setTo(to);
      // new refresh all cards
    });

  return (
    <div className={classes.root}>
      <AppBar position="sticky" color="inherit">
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">
            {deviceName}
          </Typography>
        </Toolbar>
      </AppBar>

      {/** Calendar state */}
      <CalendarLine handleSubmit={handleSubmit} dayslist={dayslistcalendar} />

      {/** Content State */}
      <div className={classes.content}>
        <Box m="10px">
        <Box m="15px"/>
          <Box
          display="grid"
          gridTemplateColumns={gcolgraph}
          gridAutoRows="140px"
          gap="15px"
          >
             {/**Timeline*/}
            <Box
              gridColumn={desktop ? 'span 4':'span 5'}
              gridRow="span 2"
              //backgroundColor={colors}
              m="-5px"
              p="0 10px"
              height="310x"
              sx={{
                borderRadius: 3,
                border:1,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="600"
              >
                {'Timeline'} 
              </Typography>
              <Box 
                height="225px"
                m="-6px 0 0 0" 
                //backgroundColor={colors}
              >
                {/*Timeline card*/}
                <TimelineMap datapositions={positions} deviceId={deviceId} from={from} to={to}/>
              </Box>
            </Box>

             {/**Working on*/}
            <Box
              gridColumn={desktop ? 'span 4':'span 5'}
              gridRow="span 2"
              //backgroundColor={colors}
              m="-5px"
              p="0 10px"
              sx={{
                borderRadius: 3,
                border:1,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="600"
              >
              {t('reportEngineHours') + ' [' + formatNumericHours(enginehours,t) + ']'} 
              </Typography>
              <LineChartAttributes routesdata={routes} from={from} to={to} attr='ignition' min={0} max={1.5} interpola='step' yaxistick={false} />
            </Box>
            
            {/**Fuel Chart*/}
            <Box
              gridColumn={desktop ? 'span 4':'span 5'}
              gridRow="span 2"
              //backgroundColor={colors}
              m="-5px"
              p="0 10px"
              sx={{
                borderRadius: 3,
                border:1,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="600"
              >
              {t('reportSpentFuel') + ' ['+ spentfuel.toFixed(2) +'%]'} 
              </Typography>
              <LineChartAttributes routesdata={routes} from={from} to={to} attr='fuel' min={0} max={100} />
            </Box>

            {/**Power Chart*/}
            <Box
              gridColumn={desktop ? 'span 4':'span 5'}
              gridRow="span 2"
              //backgroundColor={colors}
              m="-5px"
              p="0 10px"
              sx={{
                borderRadius: 3,
                border:1,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="600"
              >
              {t('positionPower') + ' (V)'} 
              </Typography>
              <LineChartAttributes routesdata={routes} from={from} to={to} attr='power' min={0} max={36} />
            </Box>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default TimelinePage;
