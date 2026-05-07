import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Link as RouterLink } from "react-router-dom";
import { orderApi } from "../api/orderClient";
import { OrderForm } from "../components/OrderForm";
import { CreateOrderDTO, Order } from "../types";

const upcomingWindowDays = 3;

export function HomePage() {
  const [upcomingOrders, setUpcomingOrders] = useState<Order[]>([]);
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const fetchUpcomingOrders = async () => {
    try {
      setAlertLoading(true);
      setAlertError(null);
      const orders = await orderApi.getUpcomingOrders(upcomingWindowDays);
      setUpcomingOrders(orders);
    } catch (error) {
      setAlertError("納期アラート情報の取得に失敗しました");
      console.error(error);
    } finally {
      setAlertLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingOrders();
  }, []);

  const handleSubmit = async (data: CreateOrderDTO) => {
    try {
      setIsFormLoading(true);
      await orderApi.createOrder(data);
      await fetchUpcomingOrders();
    } finally {
      setIsFormLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography component="h1" variant="h1">
              注文登録
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              登録、一覧、カレンダー、顧客マスタ、納期アラートまで管理できます。
            </Typography>
          </Box>
          <Chip
            color="primary"
            icon={<AssignmentTurnedInIcon />}
            label="注文管理"
            sx={{ fontWeight: 700 }}
          />
        </Stack>
      </Box>

      {alertLoading ? (
        <Alert icon={<CircularProgress size={18} />} severity="info">
          納期アラートを確認しています
        </Alert>
      ) : alertError ? (
        <Alert severity="error">{alertError}</Alert>
      ) : upcomingOrders.length > 0 ? (
        <Alert
          icon={<WarningAmberIcon />}
          severity="warning"
          action={
            <Button component={RouterLink} to="/alerts" color="inherit" size="small">
              確認
            </Button>
          }
        >
          {upcomingWindowDays}日以内に納期を迎える未完了注文が{upcomingOrders.length}件あります。
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{ p: { xs: 2, md: 4 }, border: "1px solid", borderColor: "divider" }}
          >
            <OrderForm onSubmit={handleSubmit} isLoading={isFormLoading} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <ListAltIcon color="primary" />
                  <Box>
                    <Typography fontWeight={700}>一覧・編集・削除</Typography>
                    <Typography color="text.secondary" variant="body2">
                      登録済み注文を確認・編集できます
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  component={RouterLink}
                  to="/orders"
                  variant="outlined"
                  startIcon={<ListAltIcon />}
                  fullWidth
                >
                  注文一覧を開く
                </Button>
              </Stack>
            </Paper>
            <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CalendarMonthIcon color="primary" />
                  <Box>
                    <Typography fontWeight={700}>カレンダー表示</Typography>
                    <Typography color="text.secondary" variant="body2">
                      施工予定日と納期を日程で確認できます
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  component={RouterLink}
                  to="/calendar"
                  variant="outlined"
                  startIcon={<CalendarMonthIcon />}
                  fullWidth
                >
                  カレンダーを開く
                </Button>
              </Stack>
            </Paper>
            <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <PeopleAltIcon color="primary" />
                  <Box>
                    <Typography fontWeight={700}>顧客マスタ管理</Typography>
                    <Typography color="text.secondary" variant="body2">
                      注文登録で使う顧客情報を管理できます
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  component={RouterLink}
                  to="/customers"
                  variant="outlined"
                  startIcon={<PeopleAltIcon />}
                  fullWidth
                >
                  顧客マスタを開く
                </Button>
              </Stack>
            </Paper>
            <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <NotificationsActiveIcon color="primary" />
                  <Box>
                    <Typography fontWeight={700}>納期アラート</Typography>
                    <Typography color="text.secondary" variant="body2">
                      納期が近い未完了注文を確認できます
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  component={RouterLink}
                  to="/alerts"
                  variant={upcomingOrders.length > 0 ? "contained" : "outlined"}
                  color={upcomingOrders.length > 0 ? "warning" : "primary"}
                  startIcon={<NotificationsActiveIcon />}
                  fullWidth
                >
                  アラートを開く
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
