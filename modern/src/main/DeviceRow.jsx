import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import {
  IconButton, Tooltip, Avatar, ListItemAvatar, ListItemText, ListItemButton,
} from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import ErrorIcon from '@mui/icons-material/Error';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { devicesActions } from '../store';
import {
  formatAlarm, formatBoolean, formatPercentage, formatStatus, getStatusColor,
} from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { mapIconKey, mapIcons } from '../map/core/preloadImages';
import { useAdministrator } from '../common/util/permissions';
import EngineIcon from '../resources/images/data/engine.svg?react';
import { useAttributePreference } from '../common/util/preferences';

dayjs.extend(relativeTime);

const useStyles = makeStyles((theme) => ({
  modelText: {
    color: '#000000'
  },
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
}));

const DeviceRow = ({ data, index, style }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();

  const item = data[index];
  // console.log("🚀 ~ DeviceRow ~ item:", item)
  const position = useSelector((state) => state.session.positions[item.id]);

  const events = useSelector((state) => state.events.items.filter((e) => e.deviceId === item.id));
  const eventid = events[0];

  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  const deviceSecondary = useAttributePreference('deviceSecondary', '');

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
        <span className={classes[getStatusColor(item.status, item.lastUpdate)]}>{status}</span>
      </>
    );
  };

  const getStatusColorIcon = (item) => {
    switch (item.status) {
      case 'online':
      case 'unknown':
        return '#22C55E';
      case 'offline':
        return '#EF4444';
      default:
        return '#999999';
    }
  };

  return (
    <div style={style}>
      <ListItemButton
        key={item.id}
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
      >
        <ListItemAvatar>
          <Avatar style={{ background: getStatusColorIcon(item) }} >
            <img className={classes.icon} src={mapIcons[mapIconKey(item.category)]} alt="" />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={item[devicePrimary]}
          primaryTypographyProps={{ sx: { color: 'black' }, noWrap: true }}
          secondary={secondaryText()}
          secondaryTypographyProps={{ sx: { color: '#999' }, noWrap: true }}
        />
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
            {eventid && (
              <>
                {(eventid.hasOwnProperty('type') && eventid.type === "maintenance" && eventid.deviceId === item.id) && (
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
                  <ErrorIcon fontSize="small" className={classes.error} />
                </IconButton>
              </Tooltip>
            )}
            {/*position.attributes.hasOwnProperty('batteryLevel') && (
              <Tooltip title={`${t('positionBatteryLevel')}: ${formatPercentage(position.attributes.batteryLevel)}`}>
                <IconButton size="small">
                  {(position.attributes.batteryLevel > 70 && (
                    position.attributes.charge
                      ? (<BatteryChargingFullIcon fontSize="small" className={classes.success} />)
                      : (<BatteryFullIcon fontSize="small" className={classes.success} />)
                  )) || (position.attributes.batteryLevel > 30 && (
                    position.attributes.charge
                      ? (<BatteryCharging60Icon fontSize="small" className={classes.warning} />)
                      : (<Battery60Icon fontSize="small" className={classes.warning} />)
                  )) || (
                    position.attributes.charge
                      ? (<BatteryCharging20Icon fontSize="small" className={classes.error} />)
                      : (<Battery20Icon fontSize="small" className={classes.error} />)
                  )}
                </IconButton>
              </Tooltip>
            )*/}
          </>
        )}
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
