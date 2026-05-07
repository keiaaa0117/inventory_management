import type { ReactNode } from "react";
import { Link as RouterLink, Route, Routes, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { AlertsPage } from "./pages/AlertsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { CreateOrderPage } from "./pages/CreateOrderPage";
import { CustomersPage } from "./pages/CustomersPage";
import { HomePage } from "./pages/HomePage";
import { OrdersPage } from "./pages/OrdersPage";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
    },
    secondary: {
      main: "#0f766e",
    },
    background: {
      default: "#f7f8fb",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      '"Noto Sans JP", "Yu Gothic", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif',
    h1: {
      fontSize: "1.75rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "1.35rem",
      fontWeight: 700,
    },
  },
});

function NavButton({
  to,
  icon,
  children,
}: {
  to: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Button
      component={RouterLink}
      to={to}
      color="inherit"
      variant={active ? "outlined" : "text"}
      startIcon={icon}
      sx={{ borderColor: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}
    >
      {children}
    </Button>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ gap: 2, flexWrap: "wrap", py: 1 }}>
            <Typography component="div" variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              在庫管理システム
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <NavButton to="/" icon={<DashboardIcon />}>
                ホーム
              </NavButton>
              <NavButton to="/orders" icon={<ListAltIcon />}>
                注文一覧
              </NavButton>
              <NavButton to="/calendar" icon={<CalendarMonthIcon />}>
                カレンダー
              </NavButton>
              <NavButton to="/customers" icon={<PeopleAltIcon />}>
                顧客マスタ
              </NavButton>
              <NavButton to="/alerts" icon={<NotificationsActiveIcon />}>
                納期アラート
              </NavButton>
              <NavButton to="/orders/new" icon={<AddCircleOutlineIcon />}>
                注文登録
              </NavButton>
            </Stack>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/orders/new" element={<CreateOrderPage />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
