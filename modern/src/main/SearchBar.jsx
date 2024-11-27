import * as React from 'react';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import { Toolbar } from '@mui/material';
import { makeStyles, useTheme } from '@mui/styles';


const useStyles = makeStyles((theme) => ({
    toolbar: {
        display: 'flex',
        gap: theme.spacing(1),
    },
}));
export default function CustomizedInputBase() {
    const classes = useStyles();

    return (
        <Toolbar className={classes.toolbar}>
            <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                <SearchIcon />
            </IconButton>
            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Type Asset, Serial, VIN, etc."
                inputProps={{ 'aria-label': 'search google maps' }}
            />

        </Toolbar>
    );
}