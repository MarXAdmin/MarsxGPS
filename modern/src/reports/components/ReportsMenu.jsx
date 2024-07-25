import React from 'react';
import {
  Divider, List, ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import TimelineIcon from '@mui/icons-material/Timeline';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import RouteIcon from '@mui/icons-material/Route';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import NotesIcon from '@mui/icons-material/Notes';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useAdministrator, useRestriction } from '../../common/util/permissions';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  listItem: {
    '& a': {
      padding: '16px 20px'
    },
    '& hr': {
      width: '90%',
      margin: '0 auto',
    },
    '& path': {
      stroke: '#1F2937',
    },
    backgroundColor: 'transparent',
  },
  listItemSelected: {
    backgroundColor: '#1F2937',
    color: '#FFF',
    '& path': {
      stroke: '#FFF',
    },
    '&:hover': {
      backgroundColor: '#1F2937',
      color: '#FFF',
    },
  },
  svgIcon: {
    transition: 'transform 0.3s ease',
  },
  selected: {
    transform: 'rotate(180deg)',
  },
}));

const MenuItem = ({
  title, link, icon, selected,
}) => {
  const classes = useStyles();

  return (
    <ListItemButton
      key={link}
      component={Link}
      to={link}
      className={`${classes.listItem} ${selected ? classes.listItemSelected : ''}`}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={title} />
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className={`${classes.svgIcon} ${selected ? classes.selected : ''}`}
        >
          <path
            d="M9 18L15 12L9 6"
            stroke={selected ? '#FFF' : '#1F2937'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </ListItemButton>
  );
};

const ReportsMenu = () => {
  const t = useTranslation();
  const location = useLocation();
  const classes = useStyles();

  const admin = useAdministrator();
  const readonly = useRestriction('readonly');

  return (
    <>
      <List className={classes.listItem}>
        <MenuItem
          title={t('reportRoute')}
          link="/reports/route"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M15.3332 6.66663H15.9124C19.9754 6.66663 22.0069 6.66663 22.778 7.39634C23.4446 8.02712 23.74 8.95633 23.5601 9.85624C23.3519 10.8973 21.6933 12.0704 18.3762 14.4167L12.9568 18.2499C9.63971 20.5961 7.98115 21.7693 7.77295 22.8103C7.59298 23.7103 7.88839 24.6395 8.55499 25.2702C9.32615 26 11.3576 26 15.4206 26H16.6665M10.6665 6.66663C10.6665 8.87577 8.87564 10.6666 6.6665 10.6666C4.45736 10.6666 2.6665 8.87577 2.6665 6.66663C2.6665 4.45749 4.45736 2.66663 6.6665 2.66663C8.87564 2.66663 10.6665 4.45749 10.6665 6.66663ZM29.3332 25.3333C29.3332 27.5424 27.5423 29.3333 25.3332 29.3333C23.124 29.3333 21.3332 27.5424 21.3332 25.3333C21.3332 23.1242 23.124 21.3333 25.3332 21.3333C27.5423 21.3333 29.3332 23.1242 29.3332 25.3333Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>}
          selected={location.pathname === '/reports/route'}
        />
        <Divider />

        <MenuItem
          title={t('reportEvents')}
          link="/reports/event"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M12.4726 28.0001C13.4127 28.8299 14.6477 29.3334 16.0003 29.3334C17.3529 29.3334 18.5879 28.8299 19.5281 28.0001M3.05885 7.75994C3.03972 5.82481 4.08303 4.01774 5.76847 3.06674M28.9365 7.75995C28.9556 5.82482 27.9123 4.01775 26.2269 3.06675M24.0003 10.6667C24.0003 8.54502 23.1575 6.51018 21.6572 5.00989C20.1569 3.5096 18.1221 2.66675 16.0003 2.66675C13.8786 2.66675 11.8438 3.5096 10.3435 5.00989C8.84319 6.51018 8.00033 8.54502 8.00033 10.6667C8.00033 14.787 6.96096 17.608 5.79988 19.474C4.8205 21.0479 4.33081 21.8349 4.34877 22.0544C4.36865 22.2975 4.42015 22.3902 4.61603 22.5355C4.79294 22.6667 5.59045 22.6667 7.18547 22.6667H24.8152C26.4102 22.6667 27.2077 22.6667 27.3846 22.5355C27.5805 22.3902 27.632 22.2975 27.6519 22.0544C27.6699 21.8349 27.1802 21.0479 26.2008 19.474C25.0397 17.608 24.0003 14.787 24.0003 10.6667Z" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>}
          selected={location.pathname === '/reports/event'}
        />
        <Divider />

        <MenuItem
          title={t('reportTrips')}
          link="/reports/trip"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M4.55143 14.326C3.75764 14.0173 3.36074 13.8629 3.24487 13.6405C3.14442 13.4477 3.14428 13.2181 3.24451 13.0251C3.36012 12.8026 3.75683 12.6478 4.55027 12.3382L27.0673 3.55103C27.7835 3.27152 28.1416 3.13177 28.3705 3.20822C28.5692 3.27461 28.7251 3.43056 28.7915 3.6293C28.868 3.85813 28.7282 4.21625 28.4487 4.93249L19.6616 27.4495C19.352 28.2429 19.1972 28.6396 18.9746 28.7552C18.7817 28.8555 18.552 28.8553 18.3592 28.7549C18.1368 28.639 17.9825 28.2421 17.6738 27.4483L14.1696 18.4377C14.107 18.2765 14.0756 18.196 14.0272 18.1281C13.9844 18.068 13.9318 18.0154 13.8716 17.9725C13.8038 17.9241 13.7232 17.8928 13.5621 17.8301L4.55143 14.326Z" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>}
          selected={location.pathname === '/reports/trip'}
        />
        <Divider />

        <MenuItem
          title={t('reportStops')}
          link="/reports/stop"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M21.3332 17.8326C26.0422 18.7585 29.3332 20.873 29.3332 23.3333C29.3332 26.647 23.3636 29.3333 15.9998 29.3333C8.63604 29.3333 2.6665 26.647 2.6665 23.3333C2.6665 20.873 5.95742 18.7585 10.6665 17.8326M15.9998 22.6667V12M15.9998 12C18.209 12 19.9998 10.2091 19.9998 8C19.9998 5.79086 18.209 4 15.9998 4C13.7907 4 11.9998 5.79086 11.9998 8C11.9998 10.2091 13.7907 12 15.9998 12Z" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          }
          selected={location.pathname === '/reports/stop'}
        />
        <Divider />


        <MenuItem
          title={t('reportSummary')}
          link="/reports/summary"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M15.9998 21.3333V28M15.9998 21.3333L23.9998 28M15.9998 21.3333L7.99984 28M27.9998 4V14.9333C27.9998 17.1735 27.9998 18.2936 27.5639 19.1493C27.1804 19.9019 26.5684 20.5139 25.8158 20.8974C24.9602 21.3333 23.84 21.3333 21.5998 21.3333H10.3998C8.15963 21.3333 7.03952 21.3333 6.18388 20.8974C5.43123 20.5139 4.8193 19.9019 4.43581 19.1493C3.99984 18.2936 3.99984 17.1735 3.99984 14.9333V4M10.6665 12V16M15.9998 9.33333V16M21.3332 14.6667V16M29.3332 4H2.6665" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          }
          selected={location.pathname === '/reports/summary'}
        />
        <Divider />


        <MenuItem
          title={t('reportChart')}
          link="/reports/chart"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M28 28H6.13333C5.3866 28 5.01323 28 4.72801 27.8547C4.47713 27.7268 4.27316 27.5229 4.14532 27.272C4 26.9868 4 26.6134 4 25.8667V4M26.6667 10.6667L21.4415 16.2435C21.2435 16.4549 21.1445 16.5606 21.025 16.6152C20.9196 16.6634 20.8034 16.6833 20.688 16.6729C20.5571 16.6611 20.4286 16.5944 20.1716 16.4609L15.8284 14.2058C15.5714 14.0723 15.4429 14.0056 15.312 13.9938C15.1966 13.9834 15.0804 14.0033 14.975 14.0515C14.8555 14.1061 14.7565 14.2118 14.5585 14.4231L9.33333 20" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          }
          selected={location.pathname === '/reports/chart'}
        />
        <Divider />


        <MenuItem
          title={t('reportReplay')}
          link="/replay"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M16.0002 17.3334C18.2093 17.3334 20.0002 15.5426 20.0002 13.3334C20.0002 11.1243 18.2093 9.33341 16.0002 9.33341C13.791 9.33341 12.0002 11.1243 12.0002 13.3334C12.0002 15.5426 13.791 17.3334 16.0002 17.3334Z" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M16.0002 29.3334C21.3335 24.0001 26.6668 19.2245 26.6668 13.3334C26.6668 7.44238 21.8912 2.66675 16.0002 2.66675C10.1091 2.66675 5.3335 7.44238 5.3335 13.3334C5.3335 19.2245 10.6668 24.0001 16.0002 29.3334Z" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          }
        />
        <Divider />

        <MenuItem
          title={t('reportCombined')}
          link="/reports/combined"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M18.6668 3.02612V8.53351C18.6668 9.28025 18.6668 9.65361 18.8122 9.93883C18.94 10.1897 19.144 10.3937 19.3948 10.5215C19.6801 10.6668 20.0534 10.6668 20.8002 10.6668H26.3075M18.6668 22.6667H10.6668M21.3335 17.3334H10.6668M26.6668 13.3177V22.9334C26.6668 25.1736 26.6668 26.2937 26.2309 27.1494C25.8474 27.902 25.2354 28.5139 24.4828 28.8974C23.6271 29.3334 22.507 29.3334 20.2668 29.3334H11.7335C9.49329 29.3334 8.37318 29.3334 7.51753 28.8974C6.76489 28.5139 6.15296 27.902 5.76947 27.1494C5.3335 26.2937 5.3335 25.1736 5.3335 22.9334V9.06675C5.3335 6.82654 5.3335 5.70643 5.76947 4.85079C6.15296 4.09814 6.76489 3.48622 7.51753 3.10272C8.37318 2.66675 9.49329 2.66675 11.7335 2.66675H16.0159C16.9942 2.66675 17.4834 2.66675 17.9438 2.77727C18.3519 2.87526 18.7421 3.03687 19.1 3.25619C19.5036 3.50355 19.8495 3.84946 20.5413 4.54126L24.7923 8.79223C25.4841 9.48404 25.83 9.82994 26.0774 10.2336C26.2967 10.5915 26.4583 10.9817 26.5563 11.3898C26.6668 11.8502 26.6668 12.3394 26.6668 13.3177Z" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          }
          selected={location.pathname === '/reports/combined'}
        />
        <Divider />

        <MenuItem
          title={t('sharedLogs')}
          link="/reports/logs"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M28 6.66675C28 8.87589 22.6274 10.6667 16 10.6667C9.37258 10.6667 4 8.87589 4 6.66675M28 6.66675C28 4.45761 22.6274 2.66675 16 2.66675C9.37258 2.66675 4 4.45761 4 6.66675M28 6.66675V25.3334C28 27.5467 22.6667 29.3334 16 29.3334C9.33333 29.3334 4 27.5467 4 25.3334V6.66675M28 12.9604C28 15.1737 22.6667 16.9604 16 16.9604C9.33333 16.9604 4 15.1737 4 12.9604M28 19.2534C28 21.4667 22.6667 23.2534 16 23.2534C9.33333 23.2534 4 21.4667 4 19.2534" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>}
          selected={location.pathname === '/reports/logs'}
        />
        <Divider />
        {!readonly && (
          <>
            <MenuItem
              title={t('reportScheduled')}
              link="/reports/scheduled"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <path d="M28 13.3334H4M28 16.6667V11.7334C28 9.4932 28 8.3731 27.564 7.51745C27.1805 6.7648 26.5686 6.15288 25.816 5.76939C24.9603 5.33341 23.8402 5.33341 21.6 5.33341H10.4C8.15979 5.33341 7.03969 5.33341 6.18404 5.76939C5.43139 6.15288 4.81947 6.7648 4.43597 7.51745C4 8.3731 4 9.4932 4 11.7334V22.9334C4 25.1736 4 26.2937 4.43597 27.1494C4.81947 27.902 5.43139 28.5139 6.18404 28.8974C7.03969 29.3334 8.15979 29.3334 10.4 29.3334H16M21.3333 2.66675V8.00008M10.6667 2.66675V8.00008M19.3333 25.3334L22 28.0001L28 22.0001" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              }
              selected={location.pathname === '/reports/scheduled'}
            />
            <Divider />
          </>
        )}
        {admin && (
          <>
            <MenuItem
              title={t('statisticsTitle')}
              link="/reports/statistics"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <path d="M12 9.33333H6.13333C5.3866 9.33333 5.01323 9.33333 4.72801 9.47866C4.47713 9.60649 4.27316 9.81046 4.14532 10.0613C4 10.3466 4 10.7199 4 11.4667V25.8667C4 26.6134 4 26.9868 4.14532 27.272C4.27316 27.5229 4.47713 27.7268 4.72801 27.8547C5.01323 28 5.3866 28 6.13333 28H12M12 28H20M12 28L12 6.13333C12 5.3866 12 5.01323 12.1453 4.72801C12.2732 4.47713 12.4771 4.27316 12.728 4.14532C13.0132 4 13.3866 4 14.1333 4L17.8667 4C18.6134 4 18.9868 4 19.272 4.14532C19.5229 4.27316 19.7268 4.47713 19.8547 4.72801C20 5.01323 20 5.3866 20 6.13333V28M20 14.6667H25.8667C26.6134 14.6667 26.9868 14.6667 27.272 14.812C27.5229 14.9398 27.7268 15.1438 27.8547 15.3947C28 15.6799 28 16.0533 28 16.8V25.8667C28 26.6134 28 26.9868 27.8547 27.272C27.7268 27.5229 27.5229 27.7268 27.272 27.8547C26.9868 28 26.6134 28 25.8667 28H20" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              }
              selected={location.pathname === '/reports/statistics'}
            />
            <Divider />
          </>
        )}
      </List>


      {/* <List>
        <MenuItem
          title={t('sharedLogs')}
          link="/reports/logs"
          icon={<NotesIcon />}
          selected={location.pathname === '/reports/logs'}
        />
        <Divider />
        {!readonly && (
          <>
            <MenuItem
              title={t('reportScheduled')}
              link="/reports/scheduled"
              icon={<EventRepeatIcon />}
              selected={location.pathname === '/reports/scheduled'}
            />
            <Divider />
          </>
        )}
        {admin && (
          <>
            <MenuItem
              title={t('statisticsTitle')}
              link="/reports/statistics"
              icon={<BarChartIcon />}
              selected={location.pathname === '/reports/statistics'}
            />
            <Divider />
          </>
        )}
      </List> */}
    </>
  );
};

export default ReportsMenu;
