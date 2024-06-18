import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FormControl, InputLabel, Select, MenuItem, 
} from '@mui/material';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import ReportFilter from './components/ReportFilter';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { useCatch } from '../reactHelper';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import {
  altitudeFromMeters, distanceFromMeters, speedFromKnots, volumeFromLiters,
} from '../common/util/converter';
import useReportStyles from './common/useReportStyles';

const ChartReportPage = () => {
  const classes = useReportStyles();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const server = useSelector((state) => state.session.server);
  const serverDarkMode = server?.attributes?.darkMode;

  const distanceUnit = useAttributePreference('distanceUnit');
  const altitudeUnit = useAttributePreference('altitudeUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');
  const hours12 = usePreference('twelveHourFormat');

  const [items, setItems] = useState([]);
  const [types, setTypes] = useState(['fuel']);
  const [type, setType] = useState('fuel');

  const values = items.map((it) => it[type]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;
  

  const handleSubmit = useCatch(async ({ deviceId, from, to }) => {
    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch(`/api/reports/route?${query.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const positions = await response.json();
      const keySet = new Set();
      const keyList = [];
      const formattedPositions = positions.map((position) => {
        const data = { ...position, ...position.attributes };
        const formatted = {};
        formatted.fixTime = dayjs(position.fixTime).valueOf();
        Object.keys(data).filter((key) => !['id', 'deviceId'].includes(key)).forEach((key) => {
          const value = data[key];
          if (typeof value === 'number') {
            keySet.add(key);
            const definition = positionAttributes[key] || {};
            switch (definition.dataType) {
              case 'speed':
                formatted[key] = speedFromKnots(value, speedUnit).toFixed(2);
                break;
              case 'altitude':
                formatted[key] = altitudeFromMeters(value, altitudeUnit).toFixed(2);
                break;
              case 'distance':
                formatted[key] = distanceFromMeters(value, distanceUnit).toFixed(2);
                break;
              case 'volume':
                formatted[key] = volumeFromLiters(value, volumeUnit).toFixed(2);
                break;
              case 'hours':
                formatted[key] = (value / 3600000).toFixed(2);
                break;
              default:
                formatted[key] = value;
                break;
            }
          }
        });
        return formatted;
      });
      Object.keys(positionAttributes).forEach((key) => {
        if (keySet.has(key)) {
          keyList.push(key);
          keySet.delete(key);
        }
      });
      setTypes([...keyList, ...keySet]);
      setItems(formattedPositions);
    } else {
      throw Error(await response.text());
    }
  });

  const colors = ( serverDarkMode ? "#1F2A40" : "#e0e0e0" )

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatTime(label, 'seconds', hours12)}`}</p> 
          <p className="label">{type} : {`${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportChart']}>
      <ReportFilter handleSubmit={handleSubmit} showOnly>
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>{t('reportChartType')}</InputLabel>
            <Select
              label={t('reportChartType')}
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={!items.length}
            >
              {types.map((key) => (
                <MenuItem key={key} value={key}>{positionAttributes[key]?.name || key}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </ReportFilter>
      {items.length > 0 && (
        <div className={classes.chart}>
          <ResponsiveContainer>
              <AreaChart
                data={items}
                margin={{
                  top: 10, right: 20, left: 15, bottom: 15,
                }}
              >
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="fixTime"
                  type="number"
                  tickFormatter={(value) => formatTime(value, 'time', hours12)}
                  domain={['dataMin', 'dataMax']}
                  scale="time"
                />
                <YAxis
                  type="number"
                  tickFormatter={(value) => value.toFixed(2)}
                  domain={ type === 'fuel' ? [0 , 100] : [ minValue - valueRange / 5 < 0 ? 0 : minValue - valueRange / 5 , maxValue + valueRange / 5]}
                />
                {/*<CartesianGrid strokeDasharray="3 3" />*/}
                <Tooltip content={<CustomTooltip />}/>
                <Area type="monotone" dataKey={type} stroke="#3da58a" fillOpacity={1} fill="url(#colorPv)" dot={false} connectNulls={true} />
              </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </PageLayout>
  );
};

export default ChartReportPage;
