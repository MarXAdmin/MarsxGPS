import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import {
  Typography, Container, Paper, AppBar, Toolbar, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Box,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../common/components/LocalizationProvider';
import PositionValue from '../common/components/PositionValue';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { StayPrimaryLandscape } from '@mui/icons-material';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    overflow: 'auto',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
}));

const PositionLivePage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const { id } = useParams();
  const item = useSelector((state) => state.session.positions[id]);

  const positionAttributes = usePositionAttributes(t);

  const deviceName = useSelector((state) => {
    if (item) {
      const device = state.devices.items[item.deviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

  return (
    <div className={classes.root}>
      <AppBar position="sticky" color="inherit">
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">
            {deviceName}
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.content}>
        <Container maxWidth="sm">
          <Paper>
            <Table>
                <TableHead>
                <TableRow>
                    <TableCell>{t('stateName')}</TableCell>
                    <TableCell></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {/* //device attributes*/}
                {/*{item && Object.getOwnPropertyNames(item).filter((it) => ['fixTime', 'deviceTime' , 'deviceId', 'latitude', 'longitude', 'speed', 'address','serverTime','altitude'].includes(it)).map((property) => (*/}
                {item && Object.getOwnPropertyNames(item).filter((it) => it !== 'attributes').map((property) => (
                  <TableRow key={property}>
                    <TableCell><strong>{positionAttributes[property]?.name ? positionAttributes[property]?.name : property }</strong></TableCell>
                    <TableCell><PositionValue position={item} property={property} /></TableCell>
                    </TableRow>
                ))}
                {/* //position attributes */}
                {item && Object.getOwnPropertyNames(item.attributes).map((attribute) => (
                    <TableRow key={attribute}>
                    <TableCell><strong>{positionAttributes[attribute]?.name ? positionAttributes[attribute]?.name : attribute }</strong></TableCell>
                    <TableCell><PositionValue position={item} attribute={attribute} /></TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </Paper>
        </Container>
      </div>
    </div>
  );
};

export default PositionLivePage;
