import React, { useState, useRef  } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FormControl, InputLabel, Select, MenuItem, Table, TableHead, TableRow, TableBody, TableCell,
} from '@mui/material';
import {
  formatDistance, formatSpeed, formatVolume, formatTime, formatNumericHours, formatPercentage,
} from '../common/util/formatter';
import ReportFilter from './components/ReportFilter';
import { useAttributePreference } from '../common/util/preferences';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import usePersistedState from '../common/util/usePersistedState';
import ColumnSelect from './components/ColumnSelect';
import { useCatch } from '../reactHelper';
import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';
import scheduleReport from './common/scheduleReport';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const columnsArray = [
  ['startTime', 'reportStartDate'],
  ['distance', 'sharedDistance'],
  ['startOdometer', 'reportStartOdometer'],
  ['endOdometer', 'reportEndOdometer'],
  ['averageSpeed', 'reportAverageSpeed'],
  ['maxSpeed', 'reportMaximumSpeed'],
  ['engineHours', 'reportEngineHours'],
  ['startHours', 'reportStartEngineHours'],
  ['endHours', 'reportEndEngineHours'],
  ['spentFuel', 'reportSpentFuel'],
];
const columnsMap = new Map(columnsArray);

const SummaryReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);

  const distanceUnit = useAttributePreference('distanceUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');

  const [columns, setColumns] = usePersistedState('summaryColumns', ['startTime', 'distance', 'averageSpeed']);
  const [daily, setDaily] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCatch(async ({ deviceIds, groupIds, from, to, type }) => {
    const query = new URLSearchParams({ from, to, daily });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    groupIds.forEach((groupId) => query.append('groupId', groupId));
    if (type === 'export') {
      //window.location.assign(`/api/reports/summary/xlsx?${query.toString()}`);
      handleExport();
    } else if (type === 'mail') {
      const response = await fetch(`/api/reports/summary/mail?${query.toString()}`);
      if (!response.ok) {
        throw Error(await response.text());
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/summary?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          setItems(await response.json());
        } else {
          throw Error(await response.text());
        }
      } finally {
        setLoading(false);
      }
    }
  });

  const handleSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = 'summary';
    report.attributes.daily = daily;
    const error = await scheduleReport(deviceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate('/reports/scheduled');
    }
  });

  const formatValue = (item, key) => {
    const value = item[key];
    switch (key) {
      case 'deviceId':
        return devices[value].name;
      case 'startTime':
        return formatTime(value, 'date');
      case 'startOdometer':
      case 'endOdometer':
      case 'distance':
        return formatDistance(value, distanceUnit, t);
      case 'averageSpeed':
      case 'maxSpeed':
        return value > 0 ? formatSpeed(value, speedUnit, t) : null;
      case 'engineHours':
      case 'startHours':
      case 'endHours':
        //return value > 0 ? formatNumericHours(value, t) : null;
        return value > 0 ? (value / 3600000).toFixed(2) : null;
      case 'spentFuel':
        return formatPercentage(value);
      default:
        return value;
    }
  };

  const tableRef = useRef(null);

  const handleExport = () => {
    if (!tableRef.current) return;

    // Export table directly from DOM
    const worksheet = XLSX.utils.table_to_sheet(tableRef.current);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Summary_export.xlsx');
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportSummary']}>
      <div className={classes.header}>
        <ReportFilter handleSubmit={handleSubmit} handleSchedule={handleSchedule} multiDevice includeGroups loading={loading}>
          <div className={classes.filterItem}>
            <FormControl fullWidth>
              <InputLabel>{t('sharedType')}</InputLabel>
              <Select label={t('sharedType')} value={daily} onChange={(e) => setDaily(e.target.value)}>
                <MenuItem value={false}>{t('reportSummary')}</MenuItem>
                <MenuItem value>{t('reportDaily')}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
        </ReportFilter>
      </div>
      <Table ref={tableRef} stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedDevice')}</TableCell>
            {columns.map((key) => (<TableCell key={key}>{t(columnsMap.get(key))}</TableCell>))}
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? items.map((item) => (
            <TableRow key={(`${item.deviceId}_${Date.parse(item.startTime)}`)}>
              <TableCell>{devices[item.deviceId].name}</TableCell>
              {columns.map((key) => (
                <TableCell key={key}>
                  {formatValue(item, key)}
                </TableCell>
              ))}
            </TableRow>
          )) : (<TableShimmer columns={columns.length + 1} />)}
        </TableBody>
      </Table>
    </PageLayout>
  );
};

export default SummaryReportPage;
