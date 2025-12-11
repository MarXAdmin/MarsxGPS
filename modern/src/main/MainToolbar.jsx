import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Toolbar, IconButton, OutlinedInput, InputAdornment, Popover, FormGroup, FormControlLabel, Checkbox, Badge, ListItemButton, ListItemText, Tooltip,
} from '@mui/material';
import { makeStyles, useTheme } from '@mui/styles';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useDeviceReadonly } from '../common/util/permissions';
import DeviceRow from './DeviceRow';

import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
//import { useAdministrator } from '../common/util/permissions';


const StatusCheckbox = ({ value, label, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <Checkbox value={value} onChange={onChange} />
    <ListItemText primary={label} />
  </div>
);

const DeviceStatusAccordionDetails = ({ items, onChange }) => (
  <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '4px' }}>
    {items.map((status) => (
      <StatusCheckbox key={status.value} value={status.value} label={status.label} onChange={onChange} />
    ))}
  </AccordionDetails>
);

const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: 'flex',
    gap: theme.spacing(0.5),
  },
  filterPanel: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    width: theme.dimensions.drawerWidthTablet,
    background: '#FFF',
    color: '#000',
    borderRadius: '14px',
  },
  plusIcon: {
    color: '#FFF',
    background: '#EF5713',
    borderRadius: '50%'
  },
  selectFiltter: {
    backgroundColor: 'white',
    borderRadius: '20px',
  },
  selectRoot: {
    backgroundColor: 'white',
    borderRadius: '14px',
  },
  selectInput: {
    padding: '10px',
    borderRadius: '14px',
  },
  outlinedInput: {
    borderRadius: '14px',
  },
  checkedList: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}));

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    {...props}
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem', transform: 'rotate(90deg)' }} />}
  />
))(({ theme }) => ({
  border: `1px solid #1F2937`,
  borderRadius: '14px',
  backgroundColor:
    theme.palette.mode === 'light'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
  '&.Mui-expanded': {
    backgroundColor:
      theme.palette.mode === 'light'
        ? '#1F2937'
        : 'rgba(0, 0, 0, .15)',
    color: '#FFF',
  },
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(180deg)',
    color: '#FFF'
  },
  '& .MuiAccordionSummary-content': {
    margin: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: '0',
}));

const MainToolbar = ({
  filteredDevices,
  devicesOpen,
  setDevicesOpen,
  keyword,
  setKeyword,
  filter,
  setFilter,
  filterSort,
  setFilterSort,
  filterMap,
  setFilterMap,
  handleShowBottomSheet
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

  //const admin = useAdministrator();
  const deviceReadonly = useDeviceReadonly();

  const groups = useSelector((state) => state.groups.items);
  const devices = useSelector((state) => state.devices.items);

  const toolbarRef = useRef();
  const inputRef = useRef();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [devicesAnchorEl, setDevicesAnchorEl] = useState(null);

  const deviceStatusCount = (status) => Object.values(devices).filter((d) => d.status === status).length;

  const groupItems = Object.values(groups).sort((a, b) => a.name.localeCompare(b.name)).map((group) => ({
    value: group.id,
    label: group.name
  }));

  const [expanded, setExpanded] = React.useState('panel1');

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const statuses = [
    { value: 'online', label: `${t('deviceStatusOnline')} (${deviceStatusCount('online')})` },
    { value: 'offline', label: `${t('deviceStatusOffline')} (${deviceStatusCount('offline')})` },
    { value: 'unknown', label: `${t('deviceStatusUnknown')} (${deviceStatusCount('unknown')})` },
  ];

  const sortBy = [
    { value: 'name', label: `${t('sharedName')}` },
    { value: 'lastUpdate', label: `${t('deviceLastUpdate')}` },
  ];

  const handleSortByChange = (value) => {
    if (filterSort === value) {
      setFilterSort('');
    } else {
      setFilterSort(value);
    }
  };



  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Toolbar ref={toolbarRef} className={classes.toolbar}>
      <IconButton edge="start" onClick={() => setDevicesOpen(!devicesOpen)}>
        {devicesOpen
          ?
          <MapOutlinedIcon sx={{ color: '#EF5713' }} />
          :
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="#EF5713" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      </IconButton>
      
      <OutlinedInput
        ref={inputRef}
        placeholder={t('sharedSearchDevices')}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => setDevicesAnchorEl(toolbarRef.current)}
        onBlur={() => setDevicesAnchorEl(null)}
        startAdornment={(
          <SearchIcon sx={{ color: '#999999', fontSize: 20 }} />
        )}
        endAdornment={(
          <InputAdornment position="end">
            <IconButton size="small" edge="end" onClick={() => setFilterAnchorEl(inputRef.current)}>
              <Badge color="info" variant="dot" invisible={!filter.statuses.length && !filter.groups.length}>
                {desktop ?
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M2 4.6C2 4.03995 2 3.75992 2.10899 3.54601C2.20487 3.35785 2.35785 3.20487 2.54601 3.10899C2.75992 3 3.03995 3 3.6 3H20.4C20.9601 3 21.2401 3 21.454 3.10899C21.6422 3.20487 21.7951 3.35785 21.891 3.54601C22 3.75992 22 4.03995 22 4.6V5.26939C22 5.53819 22 5.67259 21.9672 5.79756C21.938 5.90831 21.8901 6.01323 21.8255 6.10776C21.7526 6.21443 21.651 6.30245 21.4479 6.4785L15.0521 12.0215C14.849 12.1975 14.7474 12.2856 14.6745 12.3922C14.6099 12.4868 14.562 12.5917 14.5328 12.7024C14.5 12.8274 14.5 12.9618 14.5 13.2306V18.4584C14.5 18.6539 14.5 18.7517 14.4685 18.8363C14.4406 18.911 14.3953 18.9779 14.3363 19.0315C14.2695 19.0922 14.1787 19.1285 13.9971 19.2012L10.5971 20.5612C10.2296 20.7082 10.0458 20.7817 9.89827 20.751C9.76927 20.7242 9.65605 20.6476 9.58325 20.5377C9.5 20.4122 9.5 20.2142 9.5 19.8184V13.2306C9.5 12.9618 9.5 12.8274 9.46715 12.7024C9.43805 12.5917 9.39014 12.4868 9.32551 12.3922C9.25258 12.2856 9.15102 12.1975 8.94789 12.0215L2.55211 6.4785C2.34898 6.30245 2.24742 6.21443 2.17449 6.10776C2.10986 6.01323 2.06195 5.90831 2.03285 5.79756C2 5.67259 2 5.53819 2 5.26939V4.6Z" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg> :
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="16" fill="#EF5713" />
                    <path d="M22.3333 12.3333H18.3333M11.6667 12.3333H9M22.3333 19.6667H19.6667M13 19.6667H9M14.3333 14.6667C14.6398 14.6667 14.9432 14.6063 15.2263 14.4891C15.5094 14.3718 15.7666 14.1999 15.9832 13.9832C16.1999 13.7666 16.3718 13.5094 16.4891 13.2263C16.6063 12.9432 16.6667 12.6398 16.6667 12.3333C16.6667 12.0269 16.6063 11.7235 16.4891 11.4404C16.3718 11.1573 16.1999 10.9001 15.9832 10.6834C15.7666 10.4667 15.5094 10.2949 15.2263 10.1776C14.9432 10.0604 14.6398 10 14.3333 10C13.7145 10 13.121 10.2458 12.6834 10.6834C12.2458 11.121 12 11.7145 12 12.3333C12 12.9522 12.2458 13.5457 12.6834 13.9832C13.121 14.4208 13.7145 14.6667 14.3333 14.6667ZM17 22C17.6188 22 18.2123 21.7542 18.6499 21.3166C19.0875 20.879 19.3333 20.2855 19.3333 19.6667C19.3333 19.0478 19.0875 18.4543 18.6499 18.0168C18.2123 17.5792 17.6188 17.3333 17 17.3333C16.3812 17.3333 15.7877 17.5792 15.3501 18.0168C14.9125 18.4543 14.6667 19.0478 14.6667 19.6667C14.6667 20.2855 14.9125 20.879 15.3501 21.3166C15.7877 21.7542 16.3812 22 17 22Z" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>}
              </Badge>
            </IconButton>
          </InputAdornment>
        )}
        size="small"
        fullWidth
        sx={{
          backgroundColor: 'white',
          borderRadius: '20px',
        }}
      />
      <Popover
        open={!!devicesAnchorEl && !devicesOpen}
        anchorEl={devicesAnchorEl}
        onClose={() => setDevicesAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: Number(theme.spacing(2).slice(0, -2)),
        }}
        marginThreshold={0}
        slotProps={{
          paper: {
            style: { width: `calc(${toolbarRef.current?.clientWidth}px - ${theme.spacing(4)})` },
          },
        }}
        elevation={1}
        disableAutoFocus
        disableEnforceFocus
      >
        {filteredDevices.slice(0, 3).map((_, index) => (
          <DeviceRow key={filteredDevices[index].id} data={filteredDevices} index={index} />
        ))}
        {filteredDevices.length > 3 && (
          <ListItemButton alignItems="center" onClick={() => setDevicesOpen(true)}>
            <ListItemText
              primary={t('notificationAlways')}
              style={{ textAlign: 'center' }}
            />
          </ListItemButton>
        )}
      </Popover>
      <Popover
        open={!!filterAnchorEl}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            borderRadius: '14px',
          },
        }}
      >
        <div className={classes.filterPanel}>
          <Accordion sx={{ borderRadius: '14px' }} expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
            <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
              <Typography>{t('deviceStatus')}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '4px' }}>
              {statuses.map((items) => (
                <div style={{ display: 'flex', alignItems: 'center' }} key={items.value}>
                  <Checkbox
                    value={items.value}
                    checked={filter.statuses.includes(items.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilter((prevFilter) => ({
                          ...prevFilter,
                          statuses: [...new Set([...prevFilter.statuses, items.value])],
                        }));
                      } else {
                        setFilter((prevFilter) => ({
                          ...prevFilter,
                          statuses: prevFilter.statuses.filter((status) => status !== items.value),
                        }));
                      }
                    }}
                  />
                  <ListItemText primary={items.label} />
                </div>
              ))}
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{ borderRadius: '14px' }} expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
            <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
              <Typography>{t('settingsGroups')}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '4px' }}>
              {groupItems.map((items) => (
                <div style={{ display: 'flex', alignItems: 'center' }} key={items.value}>
                  <Checkbox value={items.value}
                    checked={filter.groups.includes(items.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilter((prevFilter) => ({
                          ...prevFilter,
                          groups: [...new Set([...prevFilter.groups, items.value])],
                        }));
                      } else {
                        setFilter((prevFilter) => ({
                          ...prevFilter,
                          groups: prevFilter.groups.filter((status) => status !== items.value),
                        }));
                      }
                    }} />
                  <ListItemText primary={items.label} />
                </div>
              ))}
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{ borderRadius: '14px' }} expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
            <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
              <Typography>{t('sharedSortBy')}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '4px' }}>
              {sortBy.map((items) => (
                <div style={{ display: 'flex', alignItems: 'center' }} key={items.value}>
                  <Checkbox value={items.value}
                    checked={filterSort === items.value}
                    onChange={() => handleSortByChange(items.value)} />
                  <ListItemText primary={items.label} />
                </div>
              ))}
            </AccordionDetails>
          </Accordion>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={filterMap} onChange={(e) => setFilterMap(e.target.checked)} />}
              label={t('sharedFilterMap')}
            />
          </FormGroup>
          <div>Total: {filteredDevices.length}</div>
        </div>
      </Popover>
      {
        <IconButton edge="end" onClick={() => navigate('/settings/device')} disabled={deviceReadonly}>
          <Tooltip open={!deviceReadonly && Object.keys(devices).length === 0} title={t('deviceRegisterFirst')} arrow>
            <AddIcon className={classes.plusIcon} />
          </Tooltip>
        </IconButton>
      }

    </Toolbar >
  );
};

export default MainToolbar;
