import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper, BottomNavigation, BottomNavigationAction, Menu, MenuItem, Typography, Badge,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

import { sessionActions } from '../../store';
import { useTranslation } from './LocalizationProvider';
import { useRestriction } from '../util/permissions';
import { nativePostMessage } from './NativeInterface';

import routing from "../../resources/images/icon/routing.svg";
import note from "../../resources/images/icon/note.svg";
import profile from "../../resources/images/icon/profile.svg";



const BottomMenu = ({ devicesOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const t = useTranslation();


  const readonly = useRestriction('readonly');
  const disableReports = useRestriction('disableReports');
  const user = useSelector((state) => state.session.user);
  const socket = useSelector((state) => state.session.socket);

  const [anchorEl, setAnchorEl] = useState(null);

  const isHome = location.pathname === "/";
  const containsReports = location.pathname.split('/').includes('reports');
  const containsSetting = location.pathname.split('/').includes('settings');



  const currentSelection = () => {
    if (location.pathname === `/settings/user/${user.id}`) {
      return 'account';
    } if (location.pathname.startsWith('/settings')) {
      return 'settings';
    } if (location.pathname.startsWith('/reports')) {
      return 'reports';
    } if (location.pathname === '/') {
      return 'map';
    }
    return null;
  };

  const handleSetting = () => {
    setAnchorEl(null);
    navigate('/settings/preferences');
  };

  const handleAccount = () => {
    setAnchorEl(null);
    navigate(`/settings/user/${user.id}`);
  };

  const handleLogout = async () => {
    setAnchorEl(null);

    const notificationToken = window.localStorage.getItem('notificationToken');
    if (notificationToken && !user.readonly) {
      window.localStorage.removeItem('notificationToken');
      const tokens = user.attributes.notificationTokens?.split(',') || [];
      if (tokens.includes(notificationToken)) {
        const updatedUser = {
          ...user,
          attributes: {
            ...user.attributes,
            notificationTokens: tokens.length > 1 ? tokens.filter((it) => it !== notificationToken).join(',') : undefined,
          },
        };
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });
      }
    }

    await fetch('/api/session', { method: 'DELETE' });
    nativePostMessage('logout');
    navigate('/login');
    dispatch(sessionActions.updateUser(null));
  };

  const handleSelection = (event, value) => {
    switch (value) {
      case 'map':
        navigate('/');
        break;
      case 'reports':
        navigate('/reports/combined');
        break;
      case 'settings':
        navigate('/settings/preferences');
        break;
      case 'account':
        setAnchorEl(event.currentTarget);
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <Paper square={false} elevation={3} sx={{ borderRadius: devicesOpen ? '0 0 14px 14px' : '14px', }}>
      <BottomNavigation value={currentSelection()} onChange={handleSelection} showLabels sx={{ borderRadius: devicesOpen ? '0 0 14px 14px' : '14px', }}>
        <BottomNavigationAction
          label={t('mapTitle')}
          icon={(
            <Badge color="error" variant="dot" overlap="circular" invisible={socket !== false}>
              {/* <MapIcon /> */}
              <img src={routing} alt="routing" width={24} height={24} style={{
                filter: !isHome &&
                  "grayscale(100%) brightness(40%)"
              }} />
            </Badge>
          )}
          value="map"
        />
        {!disableReports && (
          <BottomNavigationAction label={t('reportTitle')}
            icon={
              // <DescriptionIcon />
              <img
                src={note}
                alt="note"
                width={24}
                height={24}
                style={{
                  filter: containsReports
                    ? "invert(51%) sepia(73%) saturate(671%) hue-rotate(334deg) brightness(100%) contrast(101%)" // Approximate #FF8343
                    : "grayscale(100%) brightness(40%)"
                }}
              />

            }
            value="reports" />
        )}
        <BottomNavigationAction label={t('settingsUser')}
          icon={
            // <PersonIcon />
            <img
              src={profile}
              alt="profile"
              width={24}
              height={24}
              style={{
                filter: containsSetting
                  ? "invert(51%) sepia(73%) saturate(671%) hue-rotate(334deg) brightness(100%) contrast(101%)" // Approximate #FF8343
                  : "grayscale(100%) brightness(40%)"
              }}
            />
          }
          value="account" />
      </BottomNavigation>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} >
        <MenuItem onClick={handleAccount}>
          <Typography color="textPrimary">{t('settingsUser')}</Typography>
        </MenuItem>
        {!readonly && (<MenuItem onClick={handleSetting} IconButton={<SettingsIcon />}>
          <Typography color="textPrimary">{t('settingsTitle')}</Typography>
        </MenuItem> )}
        <MenuItem onClick={handleLogout}>
          <Typography color="error">{t('loginLogout')}</Typography>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default BottomMenu;
