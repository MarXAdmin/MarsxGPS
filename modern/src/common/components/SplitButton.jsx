import React, { useRef, useState } from 'react';
import {
  Button, ButtonGroup, Menu, MenuItem, Typography,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import makeStyles from '@mui/styles/makeStyles';


const useStyles = makeStyles((theme) => ({
  listItem: {
    '& a': {
      padding: '16px 20px'
    },
    '& hr': {
      width: '90%',
      margin: '0 auto',
    },
    '& path': {
      stroke: '#1F2937',
    },
    backgroundColor: 'transparent',
  },
  listItemSelected: {
    backgroundColor: '#1F2937',
    color: '#FFF',
    '& path': {
      stroke: '#FFF',
    },
    '&:hover': {
      backgroundColor: '#1F2937',
      color: '#FFF',
    },
  },
  svgIcon: {
    transition: 'transform 0.3s ease',
  },
  selected: {
    transform: 'rotate(180deg)',
  },
  btnShow: {
    background: '#FFF',
    borderRadius: '16px',
    '& button': {
      border: '0',
      '&:hover': {
        borderTopLeftRadius: '16px',
        borderBottomLeftRadius: '16px',

      },
    }
  },
  btnShowArrow: {
    border: '0',
    '&:hover': {
      border: '0',
    },
  }
}));

const SplitButton = ({
  fullWidth, variant, color, disabled, onClick, options, selected, setSelected,
}) => {
  const anchorRef = useRef();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const classes = useStyles();


  return (
    <>
      <ButtonGroup fullWidth={fullWidth} variant={variant} color={color} className={classes.btnShow} ref={anchorRef}>
        <Button disabled={disabled} onClick={() => onClick(selected)}>
          <Typography variant="button" noWrap>{options[selected]}</Typography>
        </Button>
        <Button fullWidth={false} size="small" onClick={() => setMenuAnchorEl(anchorRef.current)} className={classes.btnShowArrow}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Menu
        open={!!menuAnchorEl}
        anchorEl={menuAnchorEl}
        onClose={() => setMenuAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        {Object.entries(options).map(([key, value]) => (
          <MenuItem
            key={key}
            onClick={() => {
              setSelected(key);
              setMenuAnchorEl(null);
            }}
          >
            {value}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default SplitButton;
