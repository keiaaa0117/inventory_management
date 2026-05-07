import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
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
  Tooltip,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink } from "react-router-dom";
import { orderApi } from "../api/orderClient";
import { OrderForm } from "../components/OrderForm";
import { CreateOrderDTO, Order, Status } from "../types";
import {
  formatDate,
  formatDateTime,
  priorityColors,
  priorityLabels,
  statusColors,
  statusLabels,
} from "../utils/orderDisplay";

const allStatuses = "ALL";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "処理に失敗しました";
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | typeof allStatuses>(allStatuses);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getAllOrders();
      setOrders(data);
    } catch (err) {
      setError("注文一覧の取得に失敗しました。バックエンドが起動しているか確認してください。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === allStatuses || order.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [order.orderName, order.customerName, order.memo ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  const handleUpdate = async (data: CreateOrderDTO) => {
    if (!editingOrder) {
      return;
    }

    try {
      setSaving(true);
      await orderApi.updateOrder(editingOrder.id, data);
      setEditingOrder(null);
      setSuccessMessage("注文を更新しました");
      await fetchOrders();
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      await orderApi.deleteOrder(deleteTarget.id);
      setSuccessMessage("注文を削除しました");
      setDeleteTarget(null);
      await fetchOrders();
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

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
            注文一覧
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            登録済み注文の確認、編集、削除
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            onClick={fetchOrders}
            disabled={loading}
            startIcon={<RefreshIcon />}
          >
            再読込
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
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

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
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as Status | typeof allStatuses)
            }
            label="ステータス"
            select
            sx={{ minWidth: { xs: "100%", md: 220 } }}
          >
            <MenuItem value={allStatuses}>すべて</MenuItem>
            {Object.values(Status).map((status) => (
              <MenuItem key={status} value={status}>
                {statusLabels[status]}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow>
                <TableCell>注文名</TableCell>
                <TableCell>顧客</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell>優先度</TableCell>
                <TableCell>施工予定日</TableCell>
                <TableCell>納期</TableCell>
                <TableCell>更新日時</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      表示できる注文がありません
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow hover key={order.id}>
                    <TableCell>
                      <Typography fontWeight={700}>{order.orderName}</Typography>
                      {order.memo && (
                        <Typography color="text.secondary" variant="body2" noWrap sx={{ maxWidth: 260 }}>
                          {order.memo}
                        </Typography>
                      )}
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
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatDateTime(order.updatedAt)}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="編集">
                          <IconButton
                            aria-label={`${order.orderName}を編集`}
                            onClick={() => setEditingOrder(order)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="削除">
                          <IconButton
                            aria-label={`${order.orderName}を削除`}
                            onClick={() => setDeleteTarget(order)}
                            color="error"
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={Boolean(editingOrder)}
        onClose={() => {
          if (!saving) {
            setEditingOrder(null);
          }
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogContent dividers>
          {editingOrder && (
            <OrderForm
              initialData={editingOrder}
              onSubmit={handleUpdate}
              isLoading={saving}
              onCancel={() => setEditingOrder(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>注文を削除しますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget?.orderName} を削除します。この操作は一覧から非表示にします。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            キャンセル
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress color="inherit" size={18} /> : <DeleteOutlineIcon />}
          >
            削除する
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
