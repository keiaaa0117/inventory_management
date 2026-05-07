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
import { customerApi } from "../api/customerClient";
import { orderApi } from "../api/orderClient";
import { CustomerForm } from "../components/CustomerForm";
import { CreateCustomerDTO, Customer, Order } from "../types";
import { formatDateTime } from "../utils/orderDisplay";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "処理に失敗しました";
};

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [customerData, orderData] = await Promise.all([
        customerApi.getAllCustomers(),
        orderApi.getAllOrders(),
      ]);
      setCustomers(customerData);
      setOrders(orderData);
    } catch (err) {
      setError("顧客マスタの取得に失敗しました。バックエンドが起動しているか確認してください。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const orderCountByCustomer = useMemo(() => {
    return orders.reduce<Record<string, number>>((acc, order) => {
      acc[order.customerId] = (acc[order.customerId] ?? 0) + 1;
      return acc;
    }, {});
  }, [orders]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return customers.filter((customer) => {
      if (!normalizedQuery) {
        return true;
      }

      return [customer.name, customer.contactInfo ?? "", customer.memo ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [customers, query]);

  const openCreateForm = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (!saving) {
      setFormOpen(false);
      setEditingCustomer(null);
    }
  };

  const handleSave = async (data: CreateCustomerDTO) => {
    try {
      setSaving(true);
      setError(null);

      if (editingCustomer) {
        await customerApi.updateCustomer(editingCustomer.id, data);
        setSuccessMessage("顧客を更新しました");
      } else {
        await customerApi.createCustomer(data);
        setSuccessMessage("顧客を登録しました");
      }

      closeForm();
      await fetchData();
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
      await customerApi.deleteCustomer(deleteTarget.id);
      setSuccessMessage("顧客を削除しました");
      setDeleteTarget(null);
      await fetchData();
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
            顧客マスタ
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            顧客情報の登録、編集、削除
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            onClick={fetchData}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : <RefreshIcon />}
          >
            再読込
          </Button>
          <Button variant="contained" onClick={openCreateForm} startIcon={<AddCircleOutlineIcon />}>
            顧客登録
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
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <TextField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            label="検索"
            placeholder="顧客名・連絡先・メモ"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Chip label={`顧客 ${filteredCustomers.length}件`} sx={{ minWidth: 120 }} />
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 860 }}>
            <TableHead>
              <TableRow>
                <TableCell>顧客名</TableCell>
                <TableCell>連絡先</TableCell>
                <TableCell>注文件数</TableCell>
                <TableCell>メモ</TableCell>
                <TableCell>更新日時</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? null : (
                filteredCustomers.map((customer) => (
                  <TableRow hover key={customer.id}>
                    <TableCell>
                      <Typography fontWeight={700}>{customer.name}</Typography>
                    </TableCell>
                    <TableCell>{customer.contactInfo || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${orderCountByCustomer[customer.id] ?? 0}件`}
                        size="small"
                        color={(orderCountByCustomer[customer.id] ?? 0) > 0 ? "primary" : "default"}
                        variant={(orderCountByCustomer[customer.id] ?? 0) > 0 ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography color="text.secondary" variant="body2" noWrap sx={{ maxWidth: 280 }}>
                        {customer.memo || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatDateTime(customer.updatedAt)}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="編集">
                          <IconButton
                            aria-label={`${customer.name}を編集`}
                            onClick={() => openEditForm(customer)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="削除">
                          <IconButton
                            aria-label={`${customer.name}を削除`}
                            onClick={() => setDeleteTarget(customer)}
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

      <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="md">
        <DialogContent dividers>
          <CustomerForm
            initialData={editingCustomer ?? undefined}
            onSubmit={handleSave}
            isLoading={saving}
            onCancel={closeForm}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>顧客を削除しますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget?.name} を削除します。既存注文の顧客名は履歴として残ります。
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
