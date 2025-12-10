import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import { alpha, styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useThemeContext } from '../theme/ThemeConext';
import { Box, Typography } from '@mui/material';
import logo from '../../../assets/img/nav/Logo_Alcaldía_Mayor_de_Tunja.png';


const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  width: '100%',
  [theme.breakpoints.up('sm')]: { width: '320px' },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

export default function TopNavigation() {
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [busqueda, setBusqueda] = React.useState('');

  React.useEffect(() => {
    const q = busqueda.trim();
    if (!q) return;
    const id = setTimeout(() => {
      if (q.length < 2) return;
      const target = `/land/buscar/${encodeURIComponent(q)}`;
      if (location.pathname !== target) navigate(target);
      setBusqueda('');
    }, 600);
    return () => clearTimeout(id);
  }, [busqueda, navigate, location.pathname]);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          top: 48, // debajo del SmallNav
          bgcolor: 'background.paper',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* IZQUIERDA: Logo / título */}
          <Box sx={{ width: 200, display: 'flex', alignItems: 'center' }}>
            <Link to="/land" style={{ textDecoration: 'none', color: 'inherit' }}>
              {/* IZQUIERDA: Logo importado */}
              <Box sx={{ width: 200, display: 'flex', alignItems: 'center' }}>
                <Link to="/land" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img
                    src={logo}
                    alt="Logo"
                    style={{ height: 100, objectFit: 'contain', padding: 10 }}
                  />
                </Link>
              </Box>

            </Link>
          </Box>

          {/* CENTRO: títulos centrados */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                alignItems: 'center',
                '& a': {
                  textDecoration: 'none',
                  color: (theme) =>
                    theme.palette.mode === 'light'
                      ? theme.palette.text.primary
                      : theme.palette.common.white,
                  fontWeight: 600,
                },
              }}
            >
              <Link to="/land">INICIO</Link>
              <Link to="/quienes-somos">QUIÉNES SOMOS</Link>
              <Link to="/tramites">TRÁMITES</Link>
              <Link to="/blog">BLOG</Link>
            </Box>
          </Box>

          {/* DERECHA: buscador + toggle tema */}
          <Box sx={{ width: 360, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Buscar…"
                inputProps={{ 'aria-label': 'buscar' }}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </Search>

            <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 1 }}>
              {mode === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Toolbar />
    </>
  );
}
