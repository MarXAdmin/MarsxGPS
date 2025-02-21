import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  TableFooter,
  Link,
  Tooltip,
  Box,
  Chip,
  Stack,
  //Divider,
  Switch,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';
import PublishIcon from '../../resources/images/data/command.svg?react';
import EditIcon from '../../resources/images/data/edit.svg?react';
import DeleteIcon from '../../resources/images/data/delete.svg?react';
import PendingIcon from '../../resources/images/data/extra.svg?react';
import LinkIcon from '../../resources/images/data/connection.svg?react';
import TimelineIcon from '../../resources/images/data/timeline.svg?react';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import MileageIcon from '../../resources/images/data/mileage.svg?react';
import DevicetimeIcon from '../../resources/images/data/devicetime.svg?react';

import { useTranslation } from './LocalizationProvider';
import RemoveDialog from './RemoveDialog';
import PositionValue from './PositionValue';
import { useDeviceReadonly } from '../util/permissions';
import { useAdministrator } from '../util/permissions';
import usePositionAttributes from '../attributes/usePositionAttributes';
import { devicesActions } from '../../store';
import { useCatch, useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';
import AddressValue from './AddressValue';
import { formatNumericHours, formatTime, formatDistance } from '../util/formatter';
import { mapIconAttributes, mapIconAttributesKey } from '../attributes/useIconAttributes';


const useStyles = makeStyles((theme) => ({
  card: {
    pointerEvents: 'auto',
    width: theme.dimensions.popupMaxWidth + 60,
    //background: 'linear-gradient(180deg,rgb(255, 131, 67) 10%,rgb(255, 191, 0) 70%)', 
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
    padding: theme.spacing(7, 1, 0, 2),
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    maxHeight: theme.dimensions.cardContentMaxHeight,
    overflow: 'auto',
  },
  icon: {
    width: '32px',
    height: '32px',
  },
  table: {
    '& .MuiTableCell-sizeSmall': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    '& .MuiTableCell-sizeSmall:first-child': {
      paddingRight: theme.spacing(1),
    }
  },
  cell: {
    borderBottom: 'none',
  },
  actions: {
    justifyContent: 'space-between',
    backgroundColor: theme.palette.primary.main, 
    borderRadius: 11,
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
  success: {
    color: theme.palette.success.main,
  },
}));

const StatusRow = ({ name, content }) => {
  const classes = useStyles();

  return (
    <TableRow>
      <TableCell className={classes.cell}>
        <Typography variant="body2" >{name}</Typography>
      </TableCell>
      <TableCell className={classes.cell}>
        <Typography variant="body2" color="textSecondary">{content}</Typography>
      </TableCell>
    </TableRow>
  );
};

const StatusCell = ({ name, content }) => {
  const classes = useStyles();

  return (
    <Box>
      <img className={classes.icon} src={mapIconAttributes[mapIconAttributesKey(content.props.attribute || content.props.property)]} alt={name} />
      <Typography variant="body2" >{name}</Typography>
      <Typography variant="body2" color="textSecondary">{content}</Typography>
    </Box>
  );
};

const StatusCard = ({ deviceId, position, onClose, disableActions, desktopPadding = 0, showaddresss = true, handleShowBottomSheet }) => {
  const classes = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();
  const admin = useAdministrator();

  const shareDisabled = useSelector((state) => state.session.server.attributes.disableShare);
  const user = useSelector((state) => state.session.user);
  const device = useSelector((state) => state.devices.items[deviceId]);
  const defaultItems = useSelector((state) => state.session.server.attributes.positionItems);

  const devicecategory = device?.category;
  const [switchicon, setSwitchIcon] = useState(false);

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference('positionItems', defaultItems);

  const navigationAppLink = useAttributePreference('navigationAppLink');
  const navigationAppTitle = useAttributePreference('navigationAppTitle');

  const [anchorEl, setAnchorEl] = useState(null);
  const [removing, setRemoving] = useState(false);

  const handleChange = (event) => {
    setSwitchIcon(event.target.checked);
  };

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

  const handleHoursClick = () => {
    navigate(`/settings/accumulators/${position.deviceId}`);
  };


  return (
    <>
      <div className={classes.root}>
        {device && (
          <Draggable
            handle={`.${classes.media}, .${classes.header}`}
          >
            <Card
              elevation={3}
              className={classes.card}
              sx={{
                position: 'relative',
                borderRadius: 3,
                boxShadow: 3,
                overflow: 'visible',
                border: 0,
              }}
            >
              {devicecategory && (
                <Box
                  component="img"
                  src={`/images/${devicecategory}.png`}
                  sx={{
                    position: 'absolute',
                    top: -95,
                    left: '30%',
                    transform: 'translateX(-50%)',
                    width: 200,
                    zIndex: 2,
                  }}
                />
              )
              }
              <div className={classes.header}>
                {/*<Avatar alt={device.name} src={`/api/media/${device.uniqueId}/${deviceImage}`}/>*/}
                <Box width='100%' p="5px">
                  <Typography variant='body1' color={'primary'}>
                    <strong>{device.name}</strong><br/>
                  </Typography>
                  <Typography variant='body2' color={'textSecondary'}>
                    {position && (
                      <AddressValue latitude={position.latitude} longitude={position.longitude} originalAddress={position.address} addressshow={showaddresss} />
                    )}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => {
                    onClose();
                  }}
                  onTouchStart={() => {
                    handleShowBottomSheet(false);
                    onClose();
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
              {position && (
                <CardContent className={classes.content}>
                  <Stack direction="row" spacing={1} >
                    <Chip
                      label={device.status === "online" || device.status === "unknown" ? position.attributes.ignition ? 'WORKING' : 'PARKED' : 'OFFLINE'}
                      color={device.status === "offline" ? 'error' : device.status === "unknown" ? 'default' : (position.attributes.ignition ? 'success' : 'info')}
                      sx={{ boxShadow: 3 }}
                    />
                    <strong>
                      <Chip icon={<WorkHistoryOutlinedIcon />} label={formatNumericHours(position.attributes.hours,t)}  variant="outlined" onClick={ deviceReadonly ? '' : handleHoursClick} sx={{border:"unset" }}/>
                    </strong>
                  </Stack>
                  <Chip icon={<MileageIcon />} label={formatDistance(position.attributes.totalDistance,0,t)} variant="outlined" sx={{border:"unset" }}/>
                  <Chip icon={<DevicetimeIcon  />} label={formatTime(position.deviceTime, 'seconds')} sx={{border:"unset" }} variant="outlined"></Chip>
                  <Switch size='small' checked={switchicon} onChange={handleChange} inputProps={{ 'aria-label': 'controlled' }}/>
                  <Table size="small" classes={{ root: classes.table }}>
                    {!switchicon ? (
                      <TableBody>
                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>
                            <Stack direction="row" spacing={2} >
                              {positionItems.split(',').map((key) => key.trim()).filter((key) => position.hasOwnProperty(key) || position.attributes.hasOwnProperty(key)).slice(0,5).map((key) => (
                                <StatusCell
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
                            </Stack>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    ) : (
                      <TableBody>
                        {positionItems.split(',').map((key) => key.trim()).filter((key) => position.hasOwnProperty(key) || position.attributes.hasOwnProperty(key)).map((key) => (
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
                    )}
                    {admin && (
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={2} className={classes.cell}>
                            <Typography variant="body2">
                              <Link component={RouterLink} to={`/positionlive/${deviceId}`}>{t('sharedShowDetails')}</Link>
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    )}
                  </Table>
                </CardContent>
              )}
              <CardActions classes={{ root: classes.actions }} disableSpacing>
                <Tooltip title={t('sharedExtra')}>
                  <IconButton
                    color='inherit'
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    disabled={!position}
                  >
                    <PendingIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={'Timeline'}>
                  <IconButton
                    color='inherit'
                    onClick={() => navigate(`/timeline/${deviceId}`)}
                    disabled={disableActions || !position}
                  >
                    <TimelineIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('commandTitle')}>
                  <IconButton
                    color='inherit'
                    onClick={() => navigate(`/settings/device/${deviceId}/command`)}
                    disabled={disableActions || deviceReadonly}
                  >
                    <PublishIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('sharedEdit')}>
                  <IconButton
                    color='inherit'
                    onClick={() => navigate(`/settings/device/${deviceId}`)}
                    disabled={disableActions || deviceReadonly}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={`${t("sharedConnections")}`}>
                  <IconButton
                    color='inherit'
                    onClick={() => navigate(`/settings/device/${deviceId}/connections`)}
                    disabled={disableActions || deviceReadonly}
                  >
                    <LinkIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('sharedRemove')}>
                  <IconButton
                    color="error"
                    onClick={() => setRemoving(true)}
                    disabled={disableActions || deviceReadonly}
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
          <MenuItem onClick={handleGeofence}>{t('sharedCreateGeofence')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}>{t('linkGoogleMaps')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`http://maps.apple.com/?ll=${position.latitude},${position.longitude}`}>{t('linkAppleMaps')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}>{t('linkStreetView')}</MenuItem>
          {navigationAppTitle && <MenuItem component="a" target="_blank" href={navigationAppLink.replace('{latitude}', position.latitude).replace('{longitude}', position.longitude)}>{navigationAppTitle}</MenuItem>}
          {!shareDisabled && !user.temporary && (
            <MenuItem onClick={() => navigate(`/settings/device/${deviceId}/share`)}><Typography color="secondary">{t('deviceShare')}</Typography></MenuItem>
          )}
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
