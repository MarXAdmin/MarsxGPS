import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  Slider,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import MapView from '../map/core/MapView';
import MapRoutePath from '../map/MapRoutePath';
import MapRoutePoints from '../map/MapRoutePoints';
import MapPositions from '../map/MapPositions';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatch } from '../reactHelper';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import StatusCard from '../common/components/StatusCard';
import MapScale from '../map/MapScale';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    zIndex: 3,
    left: 0,
    top: 0,
    margin: theme.spacing(1.5),
    width: theme.dimensions.drawerWidthDesktop,
    [theme.breakpoints.down('md')]: {
      width: '100%',
      margin: 0,
    },
  },
  title: {
    flexGrow: 1,
  },
  slider: {
    width: '100%',
    left: 3,
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formControlLabel: {
    height: '100%',
    width: '100%',
    paddingRight: theme.spacing(1),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(1),
    },
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(1),
    },
  },
}));

const TimelineMap = ({datapositions, deviceId, from, to}) => {
  const t = useTranslation();
  const classes = useStyles();
  const timerRef = useRef();

  
  const [positions, setPositions] = useState([]);
  const [index, setIndex] = useState(0);
  //const [selectedDeviceId, setSelectedDeviceId] = useState(defaultDeviceId);
  const selectedDeviceId = deviceId;
  const [showCard, setShowCard] = useState(false);

  useEffect(() =>  {
    handleSubmit();
  },[datapositions, from, to])

  const onPointClick = useCallback((_, index) => {
    setIndex(index);
  }, [setIndex]);

  const onMarkerClick = useCallback((positionId) => {
    setShowCard(!!positionId);
  }, [setShowCard]);

  const handleSubmit = useCatch(async () => {
    setIndex(0);
    setPositions(datapositions);
  },[setPositions]);

  return (
    <div className={classes.root}>
      <Slider
        className={classes.slider}
        max={positions.length - 1}
        step={null}
        marks={positions.map((_, index) => ({ value: index }))}
        value={index}
        onChange={(_, index) => setIndex(index)}
        size="small"
      />
      <MapView>
        <MapGeofence />
        <MapRoutePath positions={positions} />
        <MapRoutePoints positions={positions} onClick={onPointClick} />
        {index < positions.length && (
          <MapPositions positions={[positions[index]]} onClick={onMarkerClick} titleField="fixTime" />
        )}
      </MapView>
      <MapScale />
      <MapCamera positions={positions} />
      {showCard && index < positions.length && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={positions[index]}
          onClose={() => setShowCard(false)}
          disableActions
        />
      )}
    </div>
  );
};

export default TimelineMap;
