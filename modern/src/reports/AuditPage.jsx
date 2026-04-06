import { useState, useRef } from 'react';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
} from '@mui/material';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import ReportFilter from './components/ReportFilter';
import usePersistedState from '../common/util/usePersistedState';
import ColumnSelect from './components/ColumnSelect';
import { useCatch } from '../reactHelper';
import useReportStyles from './common/useReportStyles';
import TableShimmer from '../common/components/TableShimmer';

const columnsArray = [
  ['actionTime', 'positionServerTime'],
  ['address', 'positionAddress'],
  ['userId', 'settingsUser'],
  ['userEmail', 'userEmail'],
  ['actionType', 'sharedActionType'],
  ['objectType', 'sharedObjectType'],
  ['objectId', 'deviceIdentifier'],
  ['attributes', 'sharedAttributes'],
];
const columnsMap = new Map(columnsArray);

const AuditPage = () => {
  const classes = useReportStyles();
  const t = useTranslation();

  const [columns, setColumns] = usePersistedState('auditColumns', ['actionTime', 'userId', 'actionType', 'objectType']);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCatch(async ({ from, to }) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ from, to });
      const response = await fetch(`/api/audit?${query.toString()}`);
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  });

  const tableRef = useRef(null);

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportAudit']}>
      <div className={classes.header}>
        <ReportFilter handleSubmit={handleSubmit} showOnly ignoreDevice loading={loading}>
          <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
        </ReportFilter>
      </div>
      <Table ref={tableRef} stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            {columns.map((key) => (<TableCell key={key}>{t(columnsMap.get(key))}</TableCell>))}
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? items.map((item) => (
            <TableRow key={item.id}>
              {columns.map((key) => (
                <TableCell key={key}>
                  {(() => {
                    if (key === 'actionTime') return formatTime(item[key], 'minutes');
                    if (key === 'attributes') return item[key] ? JSON.stringify(item[key]) : '';
                    return item[key];
                  })()}
                </TableCell>
              ))}
            </TableRow>
          )) : (<TableShimmer columns={columns.length} />)}
        </TableBody>
      </Table>
    </PageLayout>
  );
};

export default AuditPage;
