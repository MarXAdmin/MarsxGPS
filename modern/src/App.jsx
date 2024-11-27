import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LinearProgress, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import BottomMenu from './common/components/BottomMenu';
import SocketController from './SocketController';
import CachingController from './CachingController';
import { useEffectAsync } from './reactHelper';
import { sessionActions } from './store';
import UpdateController from './UpdateController';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { BottomSheet } from 'react-spring-bottom-sheet';
import CustomBottomSheet from './main/BottomSheet'
import 'react-spring-bottom-sheet/dist/style.css';

const useStyles = makeStyles((theme) => ({
  page: {
    flexGrow: 1,
    overflow: 'auto',
  },
  menu: {
    zIndex: 500,
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    backgroundColor: '#FFF',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
  },
  menuBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    color: '#6b6b6b',
    borderRadius: '16px',
    border: '0px',
    height: '48px',
    margin: '8px',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'background-color 0.3s ease',
    backgroundColor: 'transparent',
  },
  activeButton: {
    background: 'linear-gradient(to left, #003300 0%, #006600 100%)',
    color: '#FFF',
  }
}));

const App = () => {
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const newServer = useSelector((state) => state.session.server.newServer);
  const initialized = useSelector((state) => !!state.session.user);

  const [isOpen, setOpen] = React.useState(false);
  const [activeButton, setActiveButton] = React.useState(null); // Track the active button

  useEffectAsync(async () => {
    if (!initialized) {
      const response = await fetch('/api/session');
      if (response.ok) {
        dispatch(sessionActions.updateUser(await response.json()));
      } else if (newServer) {
        navigate('/register');
      } else {
        navigate('/login');
      }
    }
    return null;
  }, [initialized]);

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    setOpen(true);
  };

  return !initialized ? (<LinearProgress />) : (
    <>
      <SocketController />
      <CachingController />
      <UpdateController />
      <div className={classes.page}>
        <Outlet />
      </div>
      {!desktop && (
        <div className={classes.menu}>
          <div className={classes.menuBottom}>
            <button
              className={`${classes.button} ${activeButton === 'feels' ? classes.activeButton : ''}`}
              onClick={() => handleButtonClick('feels')}
            >
              <ExploreOutlinedIcon /> MY FEELS
            </button>
            <button
              className={`${classes.button} ${activeButton === 'alerts' ? classes.activeButton : ''}`}
              onClick={() => handleButtonClick('alerts')}
            >
              <NotificationsNoneOutlinedIcon /> ALERTS
            </button>
            <button
              className={`${classes.button} ${activeButton === 'account' ? classes.activeButton : ''}`}
              onClick={() => handleButtonClick('account')}
            >
              <AccountCircleOutlinedIcon /> ACCOUNT
            </button>
          </div>
          <CustomBottomSheet
            isOpen={isOpen}
            onDismiss={() => setOpen(false)}
            snapPoints={({ minHeight }) => [minHeight, window.innerHeight * 0.5]}
          >
            <h3>My awesome content here</h3>
          </CustomBottomSheet>
          {/* <BottomSheet
            open={isOpen}
            onDismiss={() => setOpen(false)}
            snapPoints={({ minHeight }) => [minHeight, window.innerHeight * 0.5]}
            style={{ maxHeight: '50vh' }}
          >
            <div style={{ padding: '16px', marginBottom: '60px' }}>
              <h3>My awesome content here</h3>
            </div>
          </BottomSheet> */}
        </div>
      )}
    </>
  );
};

export default App;
