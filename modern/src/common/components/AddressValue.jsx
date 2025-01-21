import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from '@mui/material';
import { useTranslation } from './LocalizationProvider';
import { useCatch } from '../../reactHelper';

const AddressValue = ({ latitude, longitude, originalAddress, addressshow = false }) => {
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

  //Reverse Geocoding for LongDo map
  const RevGeocodingLongDo = useCatch(async () => {
    try {
      const url = `https://api.longdo.com/map/services/address?lon=${longitude}&lat=${latitude}&noelevation=1&key=${longdoAPIKey}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const road = data.road ?  data.road : '';
        const fulladdr = road + ' ' + data.subdistrict + ' ' + data.district + ' ' + data.province;
        setAddress(fulladdr);
      } else {
        throw Error("Failed to fetch address.");
      }
    } catch (err) {
      throw Error("Error fetching address: " + err.message);
    }
    
  });
  

  if (address) {
    return address;
  }
  if (addressEnabled) {
    return (<Link href="#" onClick={showAddress}>{t('sharedShowAddress')}</Link>);
  }
  return '';
};

export default AddressValue;
