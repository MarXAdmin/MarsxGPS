import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from '@mui/material';
import { useTranslation } from './LocalizationProvider';
import { useCatch } from '../../reactHelper';
import geocodingQueue from '../util/geocodingQueue';

const AddressValue = ({ latitude, longitude, originalAddress, addressshow = false, useQueue = true }) => {
  const t = useTranslation();
  const server = useSelector((state) => state.session.server);

  //const addressEnabled = useSelector((state) => state.session.server.geocoderEnabled);
  const addressEnabled = server?.geocoderEnabled;
  const longdogeoEnable = server?.attributes?.uselongdo;
  const longdoAPIKey = server?.attributes?.longdoapikey;

  const [address, setAddress] = useState();

  useEffect(() => {
    if (originalAddress) {
      setAddress(originalAddress);
    } else {
      if (addressshow) {
        if (longdogeoEnable) {
          RevGeocodingLongDo();
        } else {
          showAddress();
        }
      }
    }
  }, [latitude, longitude, originalAddress]);

  const showAddress = useCatch(async () => {
    const query = new URLSearchParams({ latitude, longitude });
    const response = await fetch(`/api/server/geocode?${query.toString()}`);
    if (response.ok) {
      setAddress(await response.text());
    } else {
      throw Error(await response.text());
    }
  });

  const fetchLongDo = async () => {
    const url = `https://api.longdo.com/map/services/address?lon=${longitude}&lat=${latitude}&noelevation=1&key=${longdoAPIKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };

  //Reverse Geocoding for LongDo map (optionally rate-limited via geocodingQueue)
  const RevGeocodingLongDo = useCatch(async () => {
    try {
      const data = await (useQueue ? geocodingQueue.enqueue(fetchLongDo) : fetchLongDo());
      const road = data.road ? data.road : '';
      const fulladdr = `${road} ${data.subdistrict} ${data.district} ${data.province}`.trim();
      setAddress(fulladdr);
    } catch (err) {
      console.log("Geocode Longdo API: Error fetching address: " + err.message);
    }
  });

  if (address) {
    return address;
  }
  if (longdogeoEnable || addressEnabled) {
    const handleClick = longdogeoEnable ? RevGeocodingLongDo : showAddress;
    return (<Link href="#" onClick={handleClick}>{t('sharedShowAddress')}</Link>);
  }
  return '';
};

export default AddressValue;
