import React, {
  useState, useCallback, useEffect,
} from 'react';
import { Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import DeviceList from './DeviceList';
import BottomMenu from '../common/components/BottomMenu';
import StatusCard from '../common/components/StatusCard';
import { devicesActions } from '../store';
import usePersistedState from '../common/util/usePersistedState';
import EventsDrawer from './EventsDrawer';
import useFilter from './useFilter';
import MainToolbar from './MainToolbar';
import MainMap from './MainMap';
import { useAttributePreference } from '../common/util/preferences';
import Drawer from '@mui/material/Drawer';
import CustomizedInputBase from './SearchBar';

import CustomBottomSheet from './BottomSheet';
import DeviceListMobile from './DeviceListMobile';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
  },
  sidebar: {
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      position: 'fixed',
      left: 0,
      top: 0,
      height: `calc(100% - ${theme.spacing(3)})`,
      width: theme.dimensions.drawerWidthDesktop,
      margin: theme.spacing(1.5),
      zIndex: 3,
    },
    [theme.breakpoints.down('md')]: {
      height: '100%',
      width: '100%',
    },
  },
  header: {
    pointerEvents: 'auto',
    zIndex: 6,
    width: '100%',
    [theme.breakpoints.down('md')]: {
      borderRadius: '0'
    },
  },
  headerMobile: {
    position: 'absolute',
    zIndex: 6,
    margin: '20px',
    width: '80vw'
  },
  footer: {
    pointerEvents: 'auto',
    zIndex: 5,
  },
  middle: {
    flex: 1,
    display: 'grid',
  },
  contentMap: {
    pointerEvents: 'auto',
    gridArea: '1 / 1',
  },
  contentList: {
    pointerEvents: 'auto',
    gridArea: '1 / 1',
    zIndex: 4,
  },
  mobileSearchHeader: {
    margin: '20px',
    position: 'absolute',
    background: 'white',
    width: 'calc(90% - 40px)',
    borderRadius: '16px',
  },
  assetCount: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginLeft: '16px'
  },
  assetCountContainer: {
    overflow: 'hidden'
  }
}));

const MainPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const mapOnSelect = useAttributePreference('mapOnSelect', true);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectedPosition = filteredPositions.find((position) => selectedDeviceId && position.deviceId === selectedDeviceId);

  const [filteredDevices, setFilteredDevices] = useState([]);

  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = usePersistedState('filter', {
    statuses: [],
    groups: [],
  });
  const [filterSort, setFilterSort] = usePersistedState('filterSort', '');
  const [filterMap, setFilterMap] = usePersistedState('filterMap', false);

  const [devicesOpen, setDevicesOpen] = useState(desktop);
  const [eventsOpen, setEventsOpen] = useState(false);

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) {
      setDevicesOpen(false);
    }
  }, [desktop, mapOnSelect, selectedDeviceId]);

  useFilter(keyword, filter, filterSort, filterMap, positions, setFilteredDevices, setFilteredPositions);

  const [isOpen, setOpen] = useState(true);
  const [selectedDevices, setSelectedDevices] = useState([]);

  const handleDeviceSelect = (device) => {
    setSelectedDevices((prevSelectedDevices) => {
      if (prevSelectedDevices.includes(device)) {
        return prevSelectedDevices.filter((d) => d !== device);
      } else {
        return [...prevSelectedDevices, device];
      }
    });
  };

  return (
    <div className={classes.root}>
      {desktop && (
        <MainMap
          filteredPositions={filteredPositions}
          selectedPosition={selectedPosition}
          onEventsClick={onEventsClick}
        />
      )}
      <div className={classes.sidebar}>
        <div className={!desktop ? classes.headerMobile : ''}>
          <Paper square elevation={3} className={classes.header}
            sx={{ borderRadius: devicesOpen ? '14px 14px 0 0' : '14px', }}>
            <MainToolbar
              filteredDevices={filteredDevices}
              devicesOpen={devicesOpen}
              setDevicesOpen={setDevicesOpen}
              keyword={keyword}
              setKeyword={setKeyword}
              filter={filter}
              setFilter={setFilter}
              filterSort={filterSort}
              setFilterSort={setFilterSort}
              filterMap={filterMap}
              setFilterMap={setFilterMap}
            />
          </Paper>
        </div>


        <div className={classes.middle}>
          {!desktop && (
            <div className={classes.contentMap}>
              <MainMap
                filteredPositions={filteredPositions}
                selectedPosition={selectedPosition}
                onEventsClick={onEventsClick}
              />
            </div>
          )}
          {/* <Paper square className={classes.contentList} style={devicesOpen ? {} : { visibility: 'hidden' }}>
            <DeviceList devices={filteredDevices} />
          </Paper> */}
          {desktop ? (
            <Paper square className={classes.contentList} style={devicesOpen ? {} : { visibility: 'hidden' }}>
              <DeviceList devices={filteredDevices} />
            </Paper>
          ) : (
            <CustomBottomSheet
              isOpen={isOpen}
              onDismiss={() => setOpen(false)}
              snapPoints={({ minHeight }) => [minHeight, window.innerHeight * 0.5]}
              selectedDevices={selectedDevices}
            >
              <div className={classes.assetCount}>{filteredDevices.length} ASSET</div>
              <DeviceListMobile devices={filteredDevices} onDeviceSelect={handleDeviceSelect} />
            </CustomBottomSheet>
          )}
        </div>
        {desktop && (
          <div className={classes.footer}>
            <BottomMenu devicesOpen={devicesOpen} />
          </div>
        )}
      </div>
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
      {selectedDeviceId && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={selectedPosition}
          onClose={() => dispatch(devicesActions.selectId(null))}
          desktopPadding={theme.dimensions.drawerWidthDesktop}
        />
      )}
    </div>
  );
};

export default MainPage;
