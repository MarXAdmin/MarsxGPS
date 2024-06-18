import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  CardMedia,
  Tooltip,
  Box,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';
import PublishIcon from '@mui/icons-material/Publish';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PendingIcon from '@mui/icons-material/Pending';
import LinkIcon from '@mui/icons-material/Link';
import DataSaverOffIcon from '@mui/icons-material/DataSaverOff';

import { useTranslation } from './LocalizationProvider';
import RemoveDialog from './RemoveDialog';
import PositionValue from './PositionValue';
import { useDeviceReadonly } from '../util/permissions';
import usePositionAttributes from '../attributes/usePositionAttributes';
import { devicesActions } from '../../store';
import { useCatch, useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';
import Avatar from '@mui/material/Avatar';
import { Gauge } from '@mui/x-charts';

const useStyles = makeStyles((theme) => ({
  card: {
    pointerEvents: 'auto',
    width: theme.dimensions.popupMaxWidth + 70,
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  mediaButton: {
    color: theme.palette.primary.contrastText,
    mixBlendMode: 'difference',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 1, 0, 2),
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    maxHeight: theme.dimensions.cardContentMaxHeight,
    overflow: 'auto',
  },
  delete: {
    color: theme.palette.error.main,
  },
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  table: {
    '& .MuiTableCell-sizeSmall': {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  cell: {
    borderBottom: 'none',
  },
  actions: {
    justifyContent: 'space-between',
  },
  root: ({ desktopPadding }) => ({
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 5,
    left: '50%',
    [theme.breakpoints.up('md')]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      bottom: theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      left: '50%',
      bottom: `calc(${theme.spacing(3)} + ${theme.dimensions.bottomBarHeight}px)`,
    },
    transform: 'translateX(-50%)',
  }),
}));

const StatusRow = ({ name, content }) => {
  const classes = useStyles();

  let server = useSelector((state) => state.session.server);
  let serverDarkMode = server?.attributes?.darkMode;
  let colors = ( serverDarkMode ? "#2F3036" : "#e0e0e0" ) //"#2F3036" : "#e0e0e0" 
  let colordata = "#3da58a";

  return (
    <TableRow>
      <TableCell className={classes.cell}>
        <Box backgroundColor={colors} borderRadius="5%" p={0.2} >
          <Typography variant="body1" color="textSecondary">{name}</Typography>
        </Box>
      </TableCell>
      <TableCell borderBottom='2rem'>
        <Box align="right" >
          <Typography variant="body1" color={colordata}>{content}</Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
};

const StatusCard = ({ deviceId, position, onClose, disableActions, desktopPadding = 0 }) => {
  const classes = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();

  const shareDisabled = useSelector((state) => state.session.server.attributes.disableShare);
  const user = useSelector((state) => state.session.user);
  const device = useSelector((state) => state.devices.items[deviceId]);

  const deviceImage = device?.attributes?.deviceImage;

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference('positionItems', 'address,fixTime,hours,ignition,fuel,power,adc2,rpm,fuelConsumption,coolantTemp');

  const [anchorEl, setAnchorEl] = useState(null);

  const [removing, setRemoving] = useState(false);

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetch('/api/devices');
      if (response.ok) {
        dispatch(devicesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
    setRemoving(false);
  });

  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: t('sharedGeofence'),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const response = await fetch('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    if (response.ok) {
      const item = await response.json();
      const permissionResponse = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: position.deviceId, geofenceId: item.id }),
      });
      if (!permissionResponse.ok) {
        throw Error(await permissionResponse.text());
      }
      navigate(`/settings/geofence/${item.id}`);
    } else {
      throw Error(await response.text());
    }
  }, [navigate, position]);

  return (
    <>
      <div className={classes.root}>
        {device && (
          <Draggable
            handle={`.${classes.media}, .${classes.header}`}
          >
            <Card elevation={3} className={classes.card}>
              {/*deviceImage ? (
                <CardMedia
                  className={classes.media}
                  image={`/api/media/${device.uniqueId}/${deviceImage}`}
                  
                >
                  <IconButton
                    size="small"
                    onClick={onClose}
                    onTouchStart={onClose}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </CardMedia>
              ) : (
                <div className={classes.header}>
                  <Typography variant="body2" color="textSecondary">
                    ---
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={onClose}
                    onTouchStart={onClose}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
              )*/}
              <div className={classes.header}>
                <Avatar alt={device.name} src={`/api/media/${device.uniqueId}/${deviceImage}`}/>
                <Box width='100%' p="7px">
                  {device.name}
                </Box>
                <IconButton
                  size="small"
                  onClick={onClose}
                  onTouchStart={onClose}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
              {position && (
                <div className={classes.header}>
                  <Box align="center">
                    <Gauge width={100} height={80} value={position.attributes.rpm ? position.attributes.rpm : position.attributes.power } startAngle={-110} endAngle={110} valueMin={0} valueMax={position.attributes.rpm ? 5000 : 30}
                            text={({ value }) => position.attributes.rpm ? `${!value?'-': value}` : `${!value?'': value.toFixed(1)}V` }
                    />
                    <Typography variant="body1" color="textSecondary">{position.attributes.rpm ? t('positionRpm') : t('positionPower') }</Typography>
                  </Box>
                  <Box align="center">
                    <Gauge width={100} height={80} value={position.attributes.fuelConsumption} startAngle={-110} endAngle={110} valueMax={30}
                            text={({ value }) => `${!value?'':value.toFixed(1)} l/h`}
                    />
                    <Typography variant="body1" color="textSecondary">{t('positionFuelConsumption')}</Typography> 
                  </Box>
                  <Box align="center">
                    <Gauge width={100} height={80} value={position.attributes.fuel} startAngle={-110} endAngle={110} 
                            text={({ value }) => `${!value?'':value.toFixed(0)} %`}
                    />
                    <Typography variant="body1" color="textSecondary">{t('positionFuel')}</Typography>
                  </Box>
                </div>
              )}
              {position && (
                <CardContent className={classes.content}>
                  <Table size="small" classes={{ root: classes.table }}>
                    <TableBody>
                      {positionItems.split(',').filter((key) => position.hasOwnProperty(key) || position.attributes.hasOwnProperty(key)).map((key) => (
                        <StatusRow
                          key={key}
                          name={positionAttributes[key]?.name || key}
                          content={(
                            <PositionValue
                              position={position}
                              property={position.hasOwnProperty(key) ? key : null}
                              attribute={position.hasOwnProperty(key) ? null : key}
                            />
                          )}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
              <CardActions classes={{ root: classes.actions }} disableSpacing>
                <IconButton
                  color="secondary"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  disabled={!position}
                >
                  <PendingIcon />
                </IconButton>
                <Tooltip title={`${t("sharedShowDetails")}`}>
                  <IconButton
                    onClick={() => navigate(`/positiondashboard/${position.id}`) }
                    disabled={disableActions || !position}
                  >
                    <DataSaverOffIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={`${t("deviceCommand")}`}>
                  <IconButton
                    onClick={() => navigate(`/settings/device/${deviceId}/command`)}
                    disabled={disableActions}
                  >
                    <PublishIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={`${t("sharedEdit")}`}>
                  <IconButton
                    onClick={() => navigate(`/settings/device/${deviceId}`)}
                    disabled={disableActions || deviceReadonly}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={`${t("sharedConnections")}`}>
                  <IconButton
                    onClick={() => navigate(`/settings/device/${deviceId}/connections`)}
                    disabled={disableActions || deviceReadonly}
                  >
                    <LinkIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={`${t("sharedRemove")}`}>
                  <IconButton
                    onClick={() => setRemoving(true)}
                    disabled={disableActions || deviceReadonly}
                    className={classes.delete}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Draggable>
        )}
      </div>
      {position && (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => navigate('/replay')}><Typography color="secondary">{t('reportReplay')}</Typography></MenuItem>
          <MenuItem onClick={handleGeofence}>{t('sharedCreateGeofence')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}>{t('linkGoogleMaps')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`http://maps.apple.com/?ll=${position.latitude},${position.longitude}`}>{t('linkAppleMaps')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}>{t('linkStreetView')}</MenuItem>
          {!shareDisabled && !user.temporary && <MenuItem onClick={() => navigate(`/settings/device/${deviceId}/share`)}>{t('deviceShare')}</MenuItem>}
        </Menu>
      )}
      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={deviceId}
        onResult={(removed) => handleRemove(removed)}
      />
    </>
  );
};

export default StatusCard;
