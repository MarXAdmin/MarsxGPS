import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  useMediaQuery, Select, MenuItem, Button, TextField, Link, Snackbar, IconButton, LinearProgress, Box,
} from '@mui/material';
import ReactCountryFlag from 'react-country-flag';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sessionActions } from '../store';
import { useLocalization, useTranslation } from '../common/components/LocalizationProvider';
import LoginLayout from './LoginLayout';
import usePersistedState from '../common/util/usePersistedState';
import { handleLoginTokenListeners, nativeEnvironment, nativePostMessage } from '../common/components/NativeInterface';
import LogoImage from './LogoImage';
import { useCatch } from '../reactHelper';

const useStyles = makeStyles((theme) => ({
  options: {
    position: 'fixed',
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '26px'
    },
    '& button': {
      borderRadius: '26px',
    }
  },
  extraContainer: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  registerButton: {
    minWidth: 'unset',
  },
  resetPassword: {
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
  logoGPS: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& img': {
      width: 'auto'
    }
  },
  logoGPSMobile: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& img': {
      width: 'auto'
    },
    marginTop: '10%'
  },
  logoLoingMobile: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& img': {
      width: 'auto'
    },
    marginTop: '20%'
  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& span': {
      margin: '0 4px',
      fontWeight: '700',
      background: 'linear-gradient(180deg, #004A9C 29.31%, #000008 124.14%)',
      '-webkit-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent',
      backgroundClip: 'text',
      textFillColor: 'transparent',
    },
  },
  titleMobile: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& span': {
      margin: '0 4px',
      fontWeight: '700',
      background: 'linear-gradient(180deg, #004A9C 29.31%, #000008 124.14%)',
      '-webkit-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent',
      backgroundClip: 'text',
      textFillColor: 'transparent',
    },
  },
  titleLogin: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '500',
    fontSize: '2rem'
  },
  iconOnly: {
    '& img': {
      borderRadius: '50%',
      objectFit: 'cover',
    }
  },
  versionContal: {
    display: 'flex',
    justifyContent: 'end',
    fontWeight: '100',
    fontSize: '0.6rem',
    color: '#0F0F0F'
  },
  containerMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '26px'
    },
    '& button': {
      borderRadius: '26px',
    }
  },
  languageSelector: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
  toggleMobile: {
    display: 'flex',
    justifyContent: 'center',
  },
  containerToggle: {
    position: 'absolute',
    display: 'flex',
    background: '#FFF',
    borderRadius: '50px',
    padding: '6px',
    filter: 'drop-shadow(0px 4px 10px rgba(255, 131, 67, 0.10))',
    '& button': {
      width: '40vw',
      color: "#000"
    }
  },
  selectButton: {
    background: theme.palette.primary.main,
    borderRadius: '50px',
    color: '#FFF',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '6px',
    width: '40vw'
  },
  containerLayoutMobile: {
    background: '#FFF',
    padding: '20px',
    borderRadius: '20px 20px 0 0'
  },
  textFieldMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    margin: '32px 0 0 0'
  },
  loginMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'absolute',
    bottom: '0',
    width: '90vw'
  }
}));

const LoginPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  const { languages, language, setLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({ code: values[0], country: values[1].country, name: values[1].name }));

  const versionApp = import.meta.env.VITE_APP_VERSION;

  const [failed, setFailed] = useState(false);

  const [email, setEmail] = usePersistedState('loginEmail', '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const registrationEnabled = useSelector((state) => state.session.server.registration);
  const languageEnabled = useSelector((state) => !state.session.server.attributes['ui.disableLoginLanguage']);
  // const changeEnabled = useSelector((state) => !state.session.server.attributes.disableChange);
  const emailEnabled = useSelector((state) => state.session.server.emailEnabled);
  const openIdEnabled = useSelector((state) => state.session.server.openIdEnabled);
  const openIdForced = useSelector((state) => state.session.server.openIdEnabled && state.session.server.openIdForce);
  const [codeEnabled, setCodeEnabled] = useState(false);

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useSelector((state) => state.session.server.announcement);

  const generateLoginToken = async () => {
    if (nativeEnvironment) {
      let token = '';
      try {
        const expiration = dayjs().add(6, 'months').toISOString();
        const response = await fetch('/api/session/token', {
          method: 'POST',
          body: new URLSearchParams(`expiration=${expiration}`),
        });
        if (response.ok) {
          token = await response.text();
        }
      } catch (error) {
        token = '';
      }
      nativePostMessage(`login|${token}`);
    }
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setFailed(false);
    try {
      const query = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const response = await fetch('/api/session', {
        method: 'POST',
        body: new URLSearchParams(code.length ? `${query}&code=${code}` : query),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        navigate('/');
      } else if (response.status === 401 && response.headers.get('WWW-Authenticate') === 'TOTP') {
        setCodeEnabled(true);
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      setFailed(true);
      setPassword('');
    }
  };

  const handleTokenLogin = useCatch(async (token) => {
    const response = await fetch(`/api/session?token=${encodeURIComponent(token)}`);
    if (response.ok) {
      const user = await response.json();
      dispatch(sessionActions.updateUser(user));
      navigate('/');
    } else {
      throw Error(await response.text());
    }
  });

  const handleSpecialKey = (e) => {
    if (e.keyCode === 13 && email && password && (!codeEnabled || code)) {
      handlePasswordLogin(e);
    }
  };

  const handleOpenIdLogin = () => {
    document.location = '/api/session/openid/auth';
  };

  useEffect(() => nativePostMessage('authentication'), []);

  useEffect(() => {
    const listener = (token) => handleTokenLogin(token);
    handleLoginTokenListeners.add(listener);
    return () => handleLoginTokenListeners.delete(listener);
  }, []);

  if (openIdForced) {
    handleOpenIdLogin();
    return (<LinearProgress />);
  }

  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const handleChange = (event) => {
    setSelectedLanguage(event.target.value);
    setLanguage(event.target.value);
  };

  return (
    <LoginLayout>
      {!isMobile ?
        <div>
          <div className={classes.container}>
            <div className={classes.logoGPS}>
              <LogoImage color={theme.palette.primary.main} />
            </div>
            <div className={classes.title}>
              <div>{t('welcomeLoginPage')}<span>MARSTIAN</span></div>
              {languageEnabled && (
                <Select
                  sx={{
                    boxShadow: "none",
                    background: 'transparent',
                    ".MuiOutlinedInput-notchedOutline": { border: 0 },
                    "&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                    {
                      border: 0,
                    },
                    "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      border: 0,
                    },
                  }}
                  value={selectedLanguage}
                  onChange={handleChange}
                  inputProps={{ 'aria-label': 'Without label' }}
                  renderValue={(selected) => {
                    const selectedItem = languageList.find((item) => item.code === selected);
                    return selectedItem ? (
                      <Box component="span" className={classes.iconOnly} >
                        <ReactCountryFlag countryCode={selectedItem.country} svg />
                      </Box>
                    ) : (
                      <div>
                      </div>
                    );
                  }}
                >
                  {languageList.map((it) => (
                    <MenuItem key={it.code} value={it.code}>
                      <Box component="span" sx={{ marginRight: '8px' }}>
                        <ReactCountryFlag countryCode={it.country} svg />
                      </Box>
                      {it.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </div>
            <div className={classes.titleLogin}>
              {t('loginTitle')}
              <Button
                className={classes.registerButton}
                onClick={() => navigate('/register')}
                disabled={!registrationEnabled}
                color="secondary"
              >
                {t('loginRegister')}
              </Button></div>
            <TextField
              required
              error={failed}
              label={t('userEmail')}
              name="email"
              value={email}
              autoComplete="email"
              autoFocus={!email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyUp={handleSpecialKey}
              helperText={failed && 'Invalid username or password'}
            />
            <TextField
              required
              error={failed}
              label={t('userPassword')}
              name="password"
              value={password}
              type="password"
              autoComplete="current-password"
              autoFocus={!!email}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={handleSpecialKey}
            />
            {codeEnabled && (
              <TextField
                required
                error={failed}
                label={t('loginTotpCode')}
                name="code"
                value={code}
                type="number"
                onChange={(e) => setCode(e.target.value)}
                onKeyUp={handleSpecialKey}
              />
            )}
            <Button
              onClick={handlePasswordLogin}
              onKeyUp={handleSpecialKey}
              variant="contained"
              // color="secondary"
              disabled={!email || !password || (codeEnabled && !code)}
              sx={{
                backgroudColor: '#EF5713',
                color: '#FFF'
              }}
            >
              {t('loginLogin')}
            </Button>
            <div className={classes.versionContal}>
              Build Version: {versionApp}
            </div>
            {openIdEnabled && (
              <Button
                onClick={() => handleOpenIdLogin()}
                variant="contained"
              >
                {t('loginOpenId')}
              </Button>
            )}
            <div className={classes.extraContainer}>
            </div>
            {emailEnabled && (
              <Link
                onClick={() => navigate('/reset-password')}
                className={classes.resetPassword}
                underline="none"
                variant="caption"
              >
                {t('loginReset')}
              </Link>
            )}
          </div>
          <Snackbar
            open={!!announcement && !announcementShown}
            message={announcement}
            action={(
              <IconButton size="small" color="inherit" onClick={() => setAnnouncementShown(true)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          />
        </div>
        :
        <div className={classes.containerMobile}>
          {/* Logo */}
          <div className={classes.logoGPSMobile}>
            <LogoImage color={theme.palette.primary.main} />
          </div>

          {/* Language Selector */}
          {languageEnabled && (
            <div className={classes.languageSelector}>
              <Select
                sx={{
                  boxShadow: "none",
                  background: 'transparent',
                  ".MuiOutlinedInput-notchedOutline": { border: 0 },
                  "&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { border: 0 },
                  "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { border: 0 },
                }}
                value={selectedLanguage}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'Without label' }}
                renderValue={(selected) => {
                  const selectedItem = languageList.find((item) => item.code === selected);
                  return selectedItem ? (
                    <Box component="span" className={classes.iconOnly}>
                      <ReactCountryFlag countryCode={selectedItem.country} svg />
                    </Box>
                  ) : null;
                }}
              >
                {languageList.map((it) => (
                  <MenuItem key={it.code} value={it.code}>
                    <Box component="span" sx={{ marginRight: '8px' }}>
                      <ReactCountryFlag countryCode={it.country} svg />
                    </Box>
                    {it.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}

          <div className={classes.toggleMobile}>
            <div className={classes.containerToggle}>
              <div className={classes.selectButton}>
                {t('loginLogin')}
              </div>
              <Button
                className={classes.registerButton}
                onClick={() => navigate('/register')}
                color="secondary"
              >
                {t('loginRegister')}
              </Button>
            </div>

          </div>
          <div className={classes.containerLayoutMobile}>
            <div className={classes.textFieldMobile}>
              <div className={classes.titleMobile}>
                <div> {t('welcomeLoginPage')} <span>MARSTIAN</span></div>
              </div>
              <TextField
                required
                error={failed}
                label={t('userEmail')}
                name="email"
                value={email}
                autoComplete="email"
                autoFocus={!email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyUp={handleSpecialKey}
                helperText={failed && 'Invalid username or password'}
              />
              <TextField
                required
                error={failed}
                label={t('userPassword')}
                name="password"
                value={password}
                type="password"
                autoComplete="current-password"
                autoFocus={!!email}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={handleSpecialKey}
              />
            </div>
            <div className={classes.logoLoingMobile}>
              <img src={'logoLoginMobile.png'} alt="" />
            </div>
            <div className={classes.loginMobile}>
              <Button
                onClick={handlePasswordLogin}
                onKeyUp={handleSpecialKey}
                variant="contained"
                // color="secondary"
                disabled={!email || !password || (codeEnabled && !code)}
                sx={{
                  backgroudColor: '#EF5713',
                  color: '#FFF'
                }}
              >
                {t('loginLogin')}
              </Button>
              <div className={classes.versionContal}>
                Build Version: {versionApp}
              </div>
            </div>

          </div>

        </div>

      }

    </LoginLayout >
  );
};

export default LoginPage;
