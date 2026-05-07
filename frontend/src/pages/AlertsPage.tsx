import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Link as RouterLink } from "react-router-dom";
import { orderApi } from "../api/orderClient";
import { Order } from "../types";
import {
  formatDate,
  priorityColors,
  priorityLabels,
  statusColors,
  statusLabels,
} from "../utils/orderDisplay";

const alertWindows = [1, 3, 7, 14, 30];

const toLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const startOfToday = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

const getDaysUntilDelivery = (deliveryDate: string) => {
  const diff = toLocalDate(deliveryDate).getTime() - startOfToday().getTime();
  return Math.round(diff / 86_400_000);
};

const getDueLabel = (daysUntilDelivery: number) => {
  if (daysUntilDelivery < 0) {
    return `${Math.abs(daysUntilDelivery)}日超過`;
  }
  if (daysUntilDelivery === 0) {
    return "本日納期";
  }
  return `あと${daysUntilDelivery}日`;
};

const getDueColor = (daysUntilDelivery: number): "error" | "warning" | "info" => {
  if (daysUntilDelivery < 0) {
    return "error";
  }
  if (daysUntilDelivery === 0) {
    return "warning";
  }
  return "info";
};

export function AlertsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [days, setDays] = useState(3);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async (targetDays = days) => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getUpcomingOrders(targetDays);
      setOrders(data);
    } catch (err) {
      setError("納期アラートの取得に失敗しました。バックエンドが起動しているか確認してください。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts(days);
  }, [days]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      if (!normalizedQuery) {
        return true;
      }

      return [order.orderName, order.customerName, order.memo ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [orders, query]);

  const summary = useMemo(() => {
    return filteredOrders.reduce(
      (acc, order) => {
        const daysUntilDelivery = getDaysUntilDelivery(order.deliveryDate);
        if (daysUntilDelivery < 0) {
          acc.overdue += 1;
        } else if (daysUntilDelivery === 0) {
          acc.today += 1;
        } else {
          acc.upcoming += 1;
        }

        if (order.priority === "HIGH") {
          acc.highPriority += 1;
        }

        return acc;
      },
      { overdue: 0, today: 0, upcoming: 0, highPriority: 0 },
    );
  }, [filteredOrders]);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography component="h1" variant="h1">
            納期アラート
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            納期が近い未完了注文を確認します
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            onClick={() => fetchAlerts(days)}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : <RefreshIcon />}
          >
            再読込
          </Button>
          <Button
            component={RouterLink}
            to="/calendar"
            variant="outlined"
            startIcon={<CalendarMonthIcon />}
          >
            カレンダー
          </Button>
          <Button
            component={RouterLink}
            to="/orders/new"
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
          >
            新規登録
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
            <Typography color="text.secondary" variant="body2">
              超過
            </Typography>
            <Typography color="error.main" variant="h4" fontWeight={700}>
              {summary.overdue}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
            <Typography color="text.secondary" variant="body2">
              本日納期
            </Typography>
            <Typography color="warning.main" variant="h4" fontWeight={700}>
              {summary.today}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
            <Typography color="text.secondary" variant="body2">
              近日納期
            </Typography>
            <Typography color="info.main" variant="h4" fontWeight={700}>
              {summary.upcoming}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
            <Typography color="text.secondary" variant="body2">
              高優先
            </Typography>
            <Typography color="error.main" variant="h4" fontWeight={700}>
              {summary.highPriority}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            label="検索"
            placeholder="注文名・顧客名・メモ"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            label="対象期間"
            select
            sx={{ minWidth: { xs: "100%", md: 180 } }}
          >
            {alertWindows.map((windowDays) => (
              <MenuItem key={windowDays} value={windowDays}>
                {windowDays}日以内
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 980 }}>
            <TableHead>
              <TableRow>
                <TableCell>アラート</TableCell>
                <TableCell>注文名</TableCell>
                <TableCell>顧客</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell>優先度</TableCell>
                <TableCell>施工予定日</TableCell>
                <TableCell>納期</TableCell>
                <TableCell>メモ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? null : (
                filteredOrders.map((order) => {
                  const daysUntilDelivery = getDaysUntilDelivery(order.deliveryDate);

                  return (
                    <TableRow hover key={order.id}>
                      <TableCell>
                        <Chip
                          icon={<WarningAmberIcon />}
                          color={getDueColor(daysUntilDelivery)}
                          label={getDueLabel(daysUntilDelivery)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={700}>{order.orderName}</Typography>
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabels[order.status]}
                          color={statusColors[order.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={priorityLabels[order.priority]}
                          color={priorityColors[order.priority]}
                          size="small"
                          variant={order.priority === "LOW" ? "outlined" : "filled"}
                        />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDate(order.constructionDate)}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDate(order.deliveryDate)}
                      </TableCell>
                      <TableCell>
                        <Typography color="text.secondary" variant="body2" noWrap sx={{ maxWidth: 260 }}>
                          {order.memo || "-"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
