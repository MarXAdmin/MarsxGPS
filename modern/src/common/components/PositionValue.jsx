import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  formatAlarm,
  formatAltitude,
  formatBoolean,
  formatCoordinate,
  formatCourse,
  formatDistance,
  formatNumber,
  formatNumericHours,
  formatPercentage,
  formatSpeed,
  formatTime,
  formatTemperature,
  formatVoltage,
  formatVolume,
  formatConsumption,
} from '../util/formatter';
import { speedToKnots } from '../util/converter';
import { useAttributePreference, usePreference } from '../util/preferences';
import { useTranslation } from './LocalizationProvider';
import { useAdministrator } from '../util/permissions';
import AddressValue from './AddressValue';
import GeofencesValue from './GeofencesValue';
import DriverValue from './DriverValue';

const PositionValue = ({ position, property, attribute }) => {
  const t = useTranslation();

  const admin = useAdministrator();

  const device = useSelector((state) => state.devices.items[position.deviceId]);

  const key = property || attribute;
  const value = property ? position[property] : position.attributes[attribute];

  const distanceUnit = useAttributePreference('distanceUnit');
  const altitudeUnit = useAttributePreference('altitudeUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');
  const coordinateFormat = usePreference('coordinateFormat');
  const hours12 = usePreference('twelveHourFormat');

  const formatValue = () => {
    switch (key) {
      case 'fixTime':
      case 'deviceTime':
      case 'serverTime':
        return formatTime(value, 'seconds', hours12);
      case 'latitude':
        return formatCoordinate('latitude', value, coordinateFormat);
      case 'longitude':
        return formatCoordinate('longitude', value, coordinateFormat);
      case 'speed':
        return value != null ? formatSpeed(value, speedUnit, t) : '';
      case 'obdSpeed':
        return value != null ? formatSpeed(speedToKnots(value, 'kmh'), speedUnit, t) : '';
      case 'course':
        return formatCourse(value);
      case 'altitude':
        return formatAltitude(value, altitudeUnit, t);
      case 'power':
      case 'battery':
        if (typeof value === 'number') {
          return formatVoltage(value.toFixed(1), t);
        }
        else {
          return '-';
        }
      case 'batteryLevel':
        return value != null ? formatPercentage(value, t) : '';
      case 'volume':
        return value != null ? formatVolume(value, volumeUnit, t) : '';
      case 'fuelConsumption':
        return value != null ? formatConsumption(value.toFixed(1), t) : '';
      case 'coolantTemp':
        return formatTemperature(value);
      case 'alarm':
        return formatAlarm(value, t);
      case 'odometer':
      case 'serviceOdometer':
      case 'tripOdometer':
      case 'obdOdometer':
      case 'distance':
      case 'totalDistance':
        return value != null ? formatDistance(value, distanceUnit, t) : '';
      case 'hours':
        return value != null ? formatNumericHours(value, t) : '';
      default:
        if (typeof value === 'number') {
          return formatNumber(value);
        } if (typeof value === 'boolean') {
          return formatBoolean(value, t);
        }
        return value || '';
    }
  };

  switch (key) {
    case 'image':
    case 'video':
    case 'audio':
      return <Link href={`/api/media/${device.uniqueId}/${value}`} target="_blank">{value}</Link>;
    case 'totalDistance':
    case 'hours':
      return (
        <>
          {formatValue(value)}
          &nbsp;&nbsp;
          {/* {admin && <Link component={RouterLink} underline="always" to={`/settings/accumulators/${position.deviceId}`}>&#9881; {t('sharedEdit')}</Link>} */}
          {admin &&
            <Link component={RouterLink} underline="always" to={`/settings/accumulators/${position.deviceId}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 18" fill="none">
                <path d="M12 20H21M3.00003 20H4.67457C5.16375 20 5.40834 20 5.63852 19.9447C5.84259 19.8957 6.03768 19.8149 6.21662 19.7053C6.41846 19.5816 6.59141 19.4086 6.93731 19.0627L19.5001 6.49998C20.3285 5.67156 20.3285 4.32841 19.5001 3.49998C18.6716 2.67156 17.3285 2.67156 16.5001 3.49998L3.93729 16.0627C3.59138 16.4086 3.41843 16.5816 3.29475 16.7834C3.18509 16.9624 3.10428 17.1574 3.05529 17.3615C3.00003 17.5917 3.00003 17.8363 3.00003 18.3255V20Z" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </Link>}
        </>
      );
    case 'address':
      return <AddressValue latitude={position.latitude} longitude={position.longitude} originalAddress={value} />;
    case 'network':
      if (value) {
        return <Link component={RouterLink} underline="none" to={`/network/${position.id}`}>{t('sharedInfoTitle')}</Link>;
      }
      return '';
    case 'geofenceIds':
      if (value) {
        return <GeofencesValue geofenceIds={value} />;
      }
      return '';
    case 'driverUniqueId':
      if (value) {
        return <DriverValue driverUniqueId={value} />;
      }
      return '';
    default:
      return formatValue(value);
  }
};

export default PositionValue;
