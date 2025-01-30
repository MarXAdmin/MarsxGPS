import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { devicesActions } from '../store';
import { useEffectAsync } from '../reactHelper';
import DeviceRow from './DeviceRow';

const useStyles = makeStyles((theme) => ({
  list: {
    width: '100%',
    height: '100%',
  },
  listInner: {
    position: 'relative',
    margin: theme.spacing(1.5, 0),
  },
}));

const DeviceListMobile = ({ devices }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const listInnerEl = useRef(null);
  const autoSizerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(300);

  useEffect(() => {
    if (autoSizerRef.current) {
      setContainerHeight(autoSizerRef.current.clientHeight);
    }
  }, [devices]);

  useEffect(() => {
    const interval = setInterval(() => setContainerHeight(autoSizerRef.current?.clientHeight || 300), 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffectAsync(async () => {
    const response = await fetch('/api/devices');
    if (response.ok) {
      dispatch(devicesActions.refresh(await response.json()));
    } else {
      throw Error(await response.text());
    }
  }, []);

  return (
    <div ref={autoSizerRef} style={{ height: '100vh', width: '100%' }}>
      <AutoSizer disableHeight className={classes.list}>
        {({ width }) => (
          <FixedSizeList
            key={devices.length}
            width={width}
            height={containerHeight}
            itemCount={devices.length}
            itemData={devices}
            itemSize={72}
            overscanCount={10}
            innerRef={listInnerEl}
          >
            {DeviceRow}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
};

export default DeviceListMobile;


