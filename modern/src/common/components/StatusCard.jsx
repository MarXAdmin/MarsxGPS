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
    width: theme.dimensions.popupMaxWidth + 100,
    borderRadius: '26px',
    padding: '20px',
    background: '#1F2937',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    color: '#FFF',
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  mediaButton: {
    // color: theme.palette.primary.contrastText,
    color: '#FFF',
    mixBlendMode: 'difference',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    // padding: theme.spacing(1, 1, 0, 2),
    padding: '0',

  },
  header2: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 1, 0, 2),
  },
  chart: {
    display: 'flex',
    justifyContent: 'space-between',
    '& .MuiGauge-valueText': {
      color: '#FFF',
    },
    '& p': {
      color: '#FFF',
    },
    '& text': {
      fill: '#FFF',
    },
    '& .MuiGauge-referenceArc': {
      fill: '#F07323',
      opacity: '0.2'
    }
  },
  content: {
    // paddingTop: theme.spacing(1),
    // paddingBottom: theme.spacing(1),
    maxHeight: theme.dimensions.cardContentMaxHeight,
    overflow: 'auto',
    padding: '0',
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
    background: '#FFF',
  },
  contentData: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    '& a': {
      color: '#1F2937',
      textDecorationColor: '#1F2937'
    }
  },
  subContentData: {
    display: 'flex',
    justifyContent: 'space-between',
    background: '#FFF',
    padding: '8px 16px 8px 16px',
    borderRadius: '26px'
  },
  titleColor: {
    color: '#1F2937',
    '& p': {
      fontWeight: '700'
    }
  },
  dataColor: {
    color: '#EF5713'
  },
  actions: {
    justifyContent: 'space-between',
    padding: '0',

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
  let colors = (serverDarkMode ? "#2F3036" : "#e0e0e0") //"#2F3036" : "#e0e0e0" 
  // let colordata = "#3da58a";
  let colordata = "#EF5713";


  return (
    <div className={classes.subContentData}>
      <div className={classes.titleColor}>
        <Typography variant="body1">{name}</Typography>
      </div>
      <div className={classes.dataColor}>
        <Typography variant="body1">{content}</Typography>
      </div>
    </div>
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
              <div className={classes.header}>
                <Avatar alt={device.name} src={`/api/media/${device.uniqueId}/${deviceImage}`} />
                <Box p="7px" sx={{ fontSize: '18px' }}>
                  {device.name}
                </Box>
                <IconButton
                  size="small"
                  onClick={onClose}
                  onTouchStart={onClose}
                >
                  <CloseIcon sx={{ color: '#FFF' }} />
                </IconButton>
              </div>
              {position && (
                <div className={classes.header2}>
                  <div className={classes.chart}>
                    <Box align="center">
                      <Gauge width={90} height={90} value={position.attributes.rpm ? position.attributes.rpm : position.attributes.power} startAngle={0} endAngle={360} valueMin={0} valueMax={position.attributes.rpm ? 5000 : 30}
                        text={({ value }) => position.attributes.rpm ? `${!value ? '-' : value}` : `${!value ? '' : value.toFixed(1)}V`}
                      />
                      <Typography variant="body1" color="textSecondary">{position.attributes.rpm ? t('positionRpm') : t('positionPower')}</Typography>
                    </Box>
                    <Box align="center">
                      <Gauge width={90} height={90} value={position.attributes.fuelConsumption} startAngle={0} endAngle={360} valueMax={30}
                        text={({ value }) => `${!value ? '' : value.toFixed(1)} l/h`}
                      />
                      <Typography variant="body1" color="textSecondary">{t('positionFuelConsumption')}</Typography>
                    </Box>
                    <Box align="center">
                      <Gauge width={90} height={90} value={position.attributes.fuel} startAngle={0} endAngle={360}
                        text={({ value }) => `${!value ? '' : value.toFixed(0)} %`}
                      />
                      <Typography variant="body1" color="textSecondary">{t('positionFuel')}</Typography>
                    </Box>
                  </div>
                </div>
              )}
              {position && (
                <CardContent className={classes.content}>
                  <div className={classes.contentData}>
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
                  </div>

                </CardContent>
              )}
              <CardActions classes={{ root: classes.actions }} disableSpacing>
                <IconButton
                  color="secondary"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  disabled={!position}
                >
                  {/* <PendingIcon /> */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
                    <path d="M16 17.8334C16.7364 17.8334 17.3334 17.2365 17.3334 16.5001C17.3334 15.7637 16.7364 15.1667 16 15.1667C15.2637 15.1667 14.6667 15.7637 14.6667 16.5001C14.6667 17.2365 15.2637 17.8334 16 17.8334Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M25.3334 17.8334C26.0698 17.8334 26.6667 17.2365 26.6667 16.5001C26.6667 15.7637 26.0698 15.1667 25.3334 15.1667C24.597 15.1667 24 15.7637 24 16.5001C24 17.2365 24.597 17.8334 25.3334 17.8334Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M6.66671 17.8334C7.40309 17.8334 8.00004 17.2365 8.00004 16.5001C8.00004 15.7637 7.40309 15.1667 6.66671 15.1667C5.93033 15.1667 5.33337 15.7637 5.33337 16.5001C5.33337 17.2365 5.93033 17.8334 6.66671 17.8334Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </IconButton>
                <Tooltip title={`${t("sharedShowDetails")}`}>
                  <IconButton
                    onClick={() => navigate(`/positiondashboard/${position.id}`)}
                    disabled={disableActions || !position}
                  >
                    {/* <DataSaverOffIcon /> */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
                      <path d="M23.5333 19.1666C23.9026 19.1666 24.0873 19.1666 24.2369 19.2486C24.3604 19.3162 24.4753 19.4433 24.5303 19.5729C24.597 19.73 24.5802 19.8971 24.5467 20.2315C24.3727 21.9649 23.7761 23.6352 22.8023 25.0927C21.6302 26.8468 19.9643 28.2139 18.0152 29.0213C16.0662 29.8286 13.9214 30.0399 11.8523 29.6283C9.78318 29.2167 7.88256 28.2008 6.3908 26.709C4.89904 25.2173 3.88314 23.3167 3.47156 21.2475C3.05999 19.1784 3.27122 17.0337 4.07856 15.0846C4.88589 13.1355 6.25307 11.4696 8.00719 10.2976C9.46469 9.32369 11.1349 8.72711 12.8683 8.55319C13.2027 8.51964 13.3699 8.50287 13.527 8.56952C13.6566 8.62451 13.7836 8.73943 13.8513 8.8629C13.9333 9.01257 13.9333 9.19724 13.9333 9.56657V18.0999C13.9333 18.4733 13.9333 18.66 14.0059 18.8026C14.0699 18.928 14.1718 19.03 14.2973 19.0939C14.4399 19.1666 14.6266 19.1666 14.9999 19.1666H23.5333Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M19.2666 4.23324C19.2666 3.8639 19.2666 3.67923 19.3486 3.52956C19.4163 3.40609 19.5433 3.29117 19.6729 3.23618C19.83 3.16952 19.9972 3.18629 20.3315 3.21983C22.7694 3.46436 25.0613 4.54297 26.8091 6.29076C28.5569 8.03855 29.6355 10.3304 29.88 12.7683C29.9135 13.1027 29.9303 13.2698 29.8637 13.427C29.8087 13.5566 29.6938 13.6836 29.5703 13.7512C29.4206 13.8332 29.2359 13.8332 28.8666 13.8332L20.3333 13.8332C19.9599 13.8332 19.7732 13.8332 19.6306 13.7606C19.5052 13.6967 19.4032 13.5947 19.3393 13.4692C19.2666 13.3266 19.2666 13.1399 19.2666 12.7666V4.23324Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </IconButton>
                </Tooltip>
                <Tooltip title={`${t("deviceCommand")}`}>
                  <IconButton
                    onClick={() => navigate(`/settings/device/${deviceId}/command`)}
                    disabled={disableActions}
                  >
                    {/* <PublishIcon /> */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
                      <path d="M28.2 4.5H4.19995M16.2 28.5V9.83333M16.2 9.83333L6.86662 19.1667M16.2 9.83333L25.5333 19.1667" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </IconButton>
                </Tooltip>
                <Tooltip title={`${t("sharedEdit")}`}>
                  <IconButton
                    onClick={() => navigate(`/settings/device/${deviceId}`)}
                    disabled={disableActions || deviceReadonly}
                  >
                    {/* <EditIcon /> */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
                      <path d="M15.4667 5.83331H9.86668C7.62646 5.83331 6.50636 5.83331 5.65071 6.26929C4.89806 6.65278 4.28614 7.2647 3.90265 8.01735C3.46667 8.873 3.46667 9.9931 3.46667 12.2333V23.4333C3.46667 25.6735 3.46667 26.7936 3.90265 27.6493C4.28614 28.4019 4.89806 29.0138 5.65071 29.3973C6.50636 29.8333 7.62646 29.8333 9.86667 29.8333H21.0667C23.3069 29.8333 24.427 29.8333 25.2826 29.3973C26.0353 29.0138 26.6472 28.4019 27.0307 27.6493C27.4667 26.7936 27.4667 25.6735 27.4667 23.4333V17.8333M11.4666 21.8333H13.6994C14.3516 21.8333 14.6777 21.8333 14.9846 21.7596C15.2567 21.6943 15.5168 21.5866 15.7554 21.4404C16.0245 21.2754 16.2551 21.0448 16.7164 20.5836L29.4667 7.83331C30.5712 6.72874 30.5712 4.93788 29.4667 3.83331C28.3621 2.72874 26.5712 2.72874 25.4667 3.83331L12.7163 16.5836C12.2551 17.0448 12.0245 17.2754 11.8596 17.5446C11.7134 17.7831 11.6056 18.0433 11.5403 18.3154C11.4666 18.6223 11.4666 18.9484 11.4666 19.6006V21.8333Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </IconButton>
                </Tooltip>
                <Tooltip title={`${t("sharedConnections")}`}>
                  <IconButton
                    onClick={() => navigate(`/settings/device/${deviceId}/connections`)}
                    disabled={disableActions || deviceReadonly}
                  >
                    {/* <LinkIcon /> */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
                      <path d="M17.3435 24.9853L15.4579 26.8709C12.8544 29.4744 8.63327 29.4744 6.02977 26.8709C3.42627 24.2674 3.42627 20.0463 6.02977 17.4428L7.91539 15.5572M24.886 17.4428L26.7716 15.5572C29.3751 12.9537 29.3751 8.73263 26.7716 6.12914C24.1681 3.52564 19.947 3.52564 17.3435 6.12914L15.4579 8.01475M11.734 21.1667L21.0673 11.8333" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </IconButton>
                </Tooltip>
                <Tooltip title={`${t("sharedRemove")}`}>
                  <IconButton
                    onClick={() => setRemoving(true)}
                    disabled={disableActions || deviceReadonly}
                    className={classes.delete}
                  >
                    {/* <DeleteIcon /> */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
                      <path d="M12 4.5H20M4 8.5H28M25.3333 8.5L24.3983 22.5257C24.258 24.63 24.1879 25.6822 23.7334 26.48C23.3332 27.1824 22.7297 27.747 22.0022 28.0996C21.176 28.5 20.1215 28.5 18.0125 28.5H13.9875C11.8785 28.5 10.824 28.5 9.99778 28.0996C9.27034 27.747 8.66678 27.1824 8.26664 26.48C7.81215 25.6822 7.742 24.63 7.60171 22.5257L6.66667 8.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
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
