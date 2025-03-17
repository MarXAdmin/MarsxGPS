import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { useAttributePreference } from '../util/preferences';
import { speedFromKnots } from '../util/converter';
import { useCatch } from '../../reactHelper';
import { formatTime } from '../util/formatter';

//export default class LineChartx extends PureComponent {
const LineChartAttributes = ( {routesdata, from, to, attr , min, max, interpola = 'monotone', yaxistick = true} ) => {

    const theme = useTheme();

    const positionAttributes = {name: attr};

    const speedUnit = useAttributePreference('speedUnit');

    const [items, setItems] = useState([]);
    const [types, setTypes] = useState([attr]);
    const [type, setType] = useState(attr);

    //auto min , max
    const values = items.map((it) => it[type]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    //const valueRange = maxValue - minValue;

    const fetchData = useCatch(async () => {
        const positions = routesdata;
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
                    //const definition = positionAttributes[key] || {};
                    //formatted[key] = value;
                    switch (key) {
                        case 'speed':
                            formatted[key] = speedFromKnots(value, speedUnit).toFixed(2);
                            break;
                        default:
                            formatted[key] = value.toFixed(2);
                            break;
                    }
                } else if (typeof value === 'boolean') {
                    switch (key) {
                        case 'motion':
                        case 'ignition':
                            formatted[key] = value ? 1 : 0;
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
    },[]);

    useEffect(() => {
        fetchData();
    },[routesdata, from, to]);

    /*const formatTime = (value, format) => {
        if (value) {
          const d = dayjs(value);
          switch (format) {
            case 'date':
              return d.format('YYYY-MM-DD');
            case 'time':
              return d.format('HH:mm');
            case 'minutes':
              return d.format('YYYY-MM-DD HH:mm');
            default:
              return d.format('HH:mm:ss');
          }
        }
        return '';
    };*/

    /*const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return (
            <div className="custom-tooltip">
              <p className="label">time: {`${formatTime(label, 'seconds')}`}</p>
              <p className="label">{ type }: { type === 'ignition' ? (payload[0].value === 1 ? 'on' : 'off') : `${payload[0].value.toFixed(2)}` }</p> 
            </div>
          );
        }
        return null;
    };*/

    return (
        <ResponsiveContainer width="100%" height="90%">
            <AreaChart
                width={500}
                height={300}
                data={items}
                margin={{
                    top: 5,
                    right: 10,
                    left: 5,
                    bottom: 5,
                }}
            >
                <defs>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffc172" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ffc172" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <XAxis 
                    dataKey="fixTime"
                    tickFormatter={(value) => formatTime(value, 'time')}
                    domain={['dataMin', 'dataMax']}
                    />
                <YAxis 
                    type="number"
                    domain={ min + max == 0 ? [minValue , parseInt(maxValue + (maxValue / 4)) ] : [min,max] }
                    tick={yaxistick}
                    />
                <Tooltip 
                    //content={<CustomTooltip />}
                    contentStyle={{ backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}
                    formatter={(value , key) => [value, positionAttributes[key]?.name || key]}
                    labelFormatter={(value) => formatTime(value, 'seconds')}
                />
                <Area type={interpola} dataKey={type} stroke="#FF8343" fillOpacity={1} fill="url(#colorPv)" dot={false} connectNulls={true}/>
            </AreaChart>
         </ResponsiveContainer>
    );
}

export default LineChartAttributes;