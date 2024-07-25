import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper, BottomNavigation, BottomNavigationAction, Menu, MenuItem, Typography, Badge,
} from '@mui/material';

import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

import { sessionActions } from '../../store';
import { useTranslation } from './LocalizationProvider';
import { useRestriction } from '../util/permissions';
import { nativePostMessage } from './NativeInterface';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  header: {
    '& svg': {
      stroke: '#FFF'
    },
    '& .Mui-selected': {
      color: '#F07323',
      '& svg': {
        color: '#F07323',
        stroke: '#F07323'
      }
    },
    [theme.breakpoints.down('md')]: {
      borderRadius: '0'
    },
  },
}));


const BottomMenu = ({ devicesOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const t = useTranslation();
  const classes = useStyles();


  const readonly = useRestriction('readonly');
  const disableReports = useRestriction('disableReports');
  const user = useSelector((state) => state.session.user);
  const socket = useSelector((state) => state.session.socket);

  const [anchorEl, setAnchorEl] = useState(null);

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
        navigate('/reports/route');
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
    <Paper square elevation={3} sx={{
      borderRadius: devicesOpen ? '0 0 14px 14px' : '14px',
    }} >
      <BottomNavigation value={currentSelection()} className={classes.header} onChange={handleSelection} showLabels sx={{ background: '#1F2937', borderRadius: devicesOpen ? '0 0 14px 14px' : '14px', }}>
        <BottomNavigationAction
          sx={{ color: '#FFF' }}
          label={t('mapTitle')}
          icon={(
            <Badge color="error" variant="dot" overlap="circular" invisible={socket !== false}>
              <MapOutlinedIcon />
            </Badge>
          )}
          value="map"
        />
        {!disableReports && (
          <BottomNavigationAction sx={{ color: '#FFF' }} label={t('reportTitle')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 33 32" fill="none">
                <path d="M19.0001 3.026V8.53339C19.0001 9.28012 19.0001 9.65349 19.1454 9.93871C19.2732 10.1896 19.4772 10.3936 19.7281 10.5214C20.0133 10.6667 20.3867 10.6667 21.1334 10.6667H26.6408M21.6667 17.3333H11.0001M21.6667 22.6666H11.0001M13.6667 12H11.0001M19.0001 2.66663H12.0667C9.82654 2.66663 8.70643 2.66663 7.85079 3.1026C7.09814 3.48609 6.48622 4.09802 6.10272 4.85066C5.66675 5.70631 5.66675 6.82642 5.66675 9.06663V22.9333C5.66675 25.1735 5.66675 26.2936 6.10272 27.1493C6.48622 27.9019 7.09814 28.5138 7.85079 28.8973C8.70643 29.3333 9.82654 29.3333 12.0667 29.3333H20.6001C22.8403 29.3333 23.9604 29.3333 24.816 28.8973C25.5687 28.5138 26.1806 27.9019 26.5641 27.1493C27.0001 26.2936 27.0001 25.1735 27.0001 22.9333V10.6666L19.0001 2.66663Z"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>}
            value="reports" />
        )}
        <BottomNavigationAction sx={{ color: '#FFF' }} label={t('settingsTitle')} icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 33 32" fill="none">
            <path d="M13.1935 25.8281L13.9728 27.5807C14.2044 28.1024 14.5825 28.5457 15.0611 28.8568C15.5397 29.1678 16.0983 29.3334 16.6691 29.3333C17.2399 29.3334 17.7985 29.1678 18.2771 28.8568C18.7557 28.5457 19.1337 28.1024 19.3654 27.5807L20.1446 25.8281C20.422 25.2062 20.8886 24.6878 21.478 24.3466C22.071 24.0045 22.7571 23.8588 23.438 23.9303L25.3446 24.1333C25.9122 24.1933 26.485 24.0874 26.9935 23.8284C27.5021 23.5694 27.9246 23.1684 28.2098 22.674C28.4954 22.18 28.6314 21.6137 28.6015 21.0438C28.5715 20.4739 28.3768 19.925 28.0409 19.4637L26.912 17.9126C26.5101 17.3561 26.2953 16.6864 26.2987 16C26.2986 15.3154 26.5154 14.6484 26.918 14.0948L28.0468 12.5437C28.3827 12.0823 28.5774 11.5334 28.6074 10.9635C28.6374 10.3937 28.5013 9.82735 28.2157 9.33329C27.9305 8.83894 27.508 8.43795 26.9995 8.17893C26.4909 7.91991 25.9181 7.814 25.3505 7.87403L23.4439 8.077C22.763 8.1485 22.0769 8.00279 21.4839 7.6607C20.8934 7.31763 20.4266 6.79644 20.1506 6.17181L19.3654 4.41922C19.1337 3.89752 18.7557 3.45425 18.2771 3.14316C17.7985 2.83207 17.2399 2.66653 16.6691 2.66663C16.0983 2.66653 15.5397 2.83207 15.0611 3.14316C14.5825 3.45425 14.2044 3.89752 13.9728 4.41922L13.1935 6.17181C12.9174 6.79644 12.4507 7.31763 11.8602 7.6607C11.2671 8.00279 10.5811 8.1485 9.90018 8.077L7.98759 7.87403C7.42003 7.814 6.84724 7.91991 6.33867 8.17893C5.83011 8.43795 5.40761 8.83894 5.1224 9.33329C4.83683 9.82735 4.70078 10.3937 4.73076 10.9635C4.76074 11.5334 4.95546 12.0823 5.29129 12.5437L6.42018 14.0948C6.82277 14.6484 7.03956 15.3154 7.03944 16C7.03956 16.6845 6.82277 17.3515 6.42018 17.9051L5.29129 19.4563C4.95546 19.9176 4.76074 20.4665 4.73076 21.0364C4.70078 21.6063 4.83683 22.1726 5.1224 22.6666C5.40789 23.1607 5.83044 23.5615 6.33893 23.8205C6.84742 24.0795 7.42007 24.1855 7.98759 24.1259L9.89425 23.9229C10.5751 23.8514 11.2612 23.9971 11.8543 24.3392C12.447 24.6813 12.9159 25.2026 13.1935 25.8281Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M16.6667 20C18.8758 20 20.6667 18.2091 20.6667 16C20.6667 13.7908 18.8758 12 16.6667 12C14.4575 12 12.6667 13.7908 12.6667 16C12.6667 18.2091 14.4575 20 16.6667 20Z"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        } value="settings" />
        {readonly ? (
          <BottomNavigationAction label={t('loginLogout')} icon={<ExitToAppIcon />} value="logout" />
        ) : (
          <BottomNavigationAction sx={{ color: '#FFF' }} label={t('settingsUser')} icon={<AccountCircleOutlinedIcon />} value="account" />
        )}
      </BottomNavigation>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleAccount}>
          <Typography color="textPrimary">{t('settingsUser')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Typography color="error">{t('loginLogout')}</Typography>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default BottomMenu;
