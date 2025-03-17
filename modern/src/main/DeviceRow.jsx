import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import {
  IconButton, Tooltip, Avatar, ListItemAvatar, ListItemText, ListItemButton, Chip, Typography,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { devicesActions } from '../store';
import {
  formatAlarm, formatBoolean, formatStatus, formatNumericHours
} from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { mapIconKey, mapIcons } from '../map/core/preloadImages';
import { useAdministrator } from '../common/util/permissions';
import EngineIcon from '../resources/images/data/engine.svg?react';
import { useAttributePreference } from '../common/util/preferences';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';



dayjs.extend(relativeTime);

const useStyles = makeStyles((theme) => ({
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  batteryText: {
    fontSize: '0.75rem',
    fontWeight: 'normal',
    lineHeight: '0.875rem',
  },
  success: {
    color: theme.palette.success.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  error: {
    color: theme.palette.error.main,
  },
  neutral: {
    color: theme.palette.neutral.main,
  },
  nameItemsMobile: {
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      fontSize: '14px',
    },
  },
  statusItems: {
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
    },
  },
  boxShawdowMobile: {
    [theme.breakpoints.down('md')]: {
      borderRadius: '16px',
      background: '#FFF',
      boxShadow: '0px 4px 10px 0px rgba(255, 131, 67, 0.10)',
      margin: '8px',
    }
  }
}));

const DeviceRow = ({ data, index, style, onDeviceClick }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const server = useSelector((state) => state.session.server);
  const admin = useAdministrator();

  const item = data[index];
  const position = useSelector((state) => state.session.positions[item.id]);

  const events = useSelector((state) => state.events.items.filter((e) =>  e.deviceId === item.id));
  const eventid = events[0];

  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  const deviceSecondary = useAttributePreference('deviceSecondary', '');

  const serverDaysoffline = server?.attributes?.daysoffline;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const secondaryText = () => {
    let status;
    if (item.status === 'online' || !item.lastUpdate) {
      status = formatStatus(item.status, t);
    } else {
      status = dayjs(item.lastUpdate).fromNow();
    }
    return (
      <>
        {deviceSecondary && item[deviceSecondary] && `${item[deviceSecondary]} • `}
        <span className={classes[getStatusColor(item.status)]}>{status}</span>
      </>
    );
  };

  function daysfromNow(xDate) {
    const currentDate = new Date();
    const pastDate = new Date(xDate);
    const timeDifference = currentDate - pastDate;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference; // Return  number of days
  };

  const getStatusColorIcon = (item) => {
    switch (item.status) {
      case 'online':
      case 'unknown':
        if (daysfromNow(item.lastUpdate) >= serverDaysoffline) {
          return 'red';
        } else {
          return 'green';
        }
      case 'offline':
        return 'red';
      default:
        return 'gray';
    }
  };
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "online":
        return "success";
      case "offline":
        return "error";
      case "unknown":
        return "neutral";
      default:
        return "neutral";
    }
  };


  return (
    <div style={style} className={classes.boxShawdowMobile}>
      <ListItemButton
        key={item.id}
        onClick={() => {
          dispatch(devicesActions.selectId(item.id));
          if (onDeviceClick) {
            onDeviceClick(item);
          }
        }}
        disabled={!admin && item.disabled}
      >
        <ListItemAvatar>
          <Avatar style={{ background: getStatusColorIcon(item) }} >
            <img className={classes.icon} src={mapIcons[mapIconKey(item.category)]} alt="" />
          </Avatar>
        </ListItemAvatar>

        {isMobile ?
          <div className={classes.nameItemsMobile}>
            <div>{item[devicePrimary]}</div>
            <div>{secondaryText()}</div>
            <div className={classes.statusItems}>
              <Chip
                label={
                  item.status === "online" || item.status === "unknown"
                    ? position?.attributes?.ignition ? "WORKING" : "PARKED"
                    : "OFFLINE"
                }
                color={
                  item.status === "offline"
                    ? "error"
                    : item.status === "unknown"
                      ? "default"
                      : position?.attributes?.ignition
                        ? "success"
                        : "info"
                }
                sx={{ boxShadow: 3 }}
                size='small'
              />
              <Typography variant='caption'>{formatNumericHours(position?.attributes?.hours, t)}</Typography>
            </div>


          </div>

          :
          <ListItemText
            primary={item[devicePrimary]}
            primaryTypographyProps={{ noWrap: true }}
            secondary={secondaryText()}
            secondaryTypographyProps={{ noWrap: true }}
          />
        }
        {position && (
          <>
            {position.attributes.hasOwnProperty('alarm') && (
              <Tooltip title={`${t('eventAlarm')}: ${formatAlarm(position.attributes.alarm, t)}`}>
                <IconButton size="small">
                  <ErrorIcon fontSize="small" className={classes.error} />
                </IconButton>
              </Tooltip>
            )}
            {/**Add Events Maintenance */}
            {eventid &&  (
              <>
                { (eventid.hasOwnProperty('type') && eventid.type === "maintenance" && eventid.deviceId === item.id) && (
                  <Tooltip title={`${eventid.attributes.message}`}>
                    <IconButton size="small">
                      <BuildCircleIcon fontSize="medium" className={classes.warning} />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
            {position.attributes.hasOwnProperty('ignition') && (
              <Tooltip title={position.attributes.output === 1 ? (t('commandEngineStop')) : (`${t('positionIgnition')}: ${formatBoolean(position.attributes.ignition, t)}`)}>
                <IconButton size="small">
                  {position.attributes.ignition ? (
                    <EngineIcon width={25} height={25} className={position.attributes.output === 1 ? classes.error : classes.success} />
                  ) : (
                    <EngineIcon width={20} height={20} className={position.attributes.output === 1 ? classes.error : classes.neutral} />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('ignition') && position.attributes.output === 1 && position.attributes.ignition && (
              <Tooltip title={`${t('alarmViolation')}`}>
                <IconButton size="small">
                  <GppMaybeIcon fontSize="small" className={classes.error} />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </ListItemButton>

    </div>
  );
};

export default DeviceRow;
