import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
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
import SaveIcon from "@mui/icons-material/Save";
import { orderCustomFieldApi } from "../api/orderCustomFieldClient";
import {
  CreateOrderCustomFieldDTO,
  OrderCustomField,
  OrderCustomFieldType,
} from "../types";

const fieldTypeLabels: Record<OrderCustomFieldType, string> = {
  [OrderCustomFieldType.TEXT]: "テキスト",
  [OrderCustomFieldType.NUMBER]: "数値",
  [OrderCustomFieldType.DATE]: "日付",
  [OrderCustomFieldType.BOOLEAN]: "はい/いいえ",
};

const emptyForm: CreateOrderCustomFieldDTO = {
  fieldName: "",
  fieldType: OrderCustomFieldType.TEXT,
  required: false,
  displayOrder: 0,
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "処理に失敗しました";
};

export function OrderFieldsPage() {
  const [fields, setFields] = useState<OrderCustomField[]>([]);
  const [form, setForm] = useState<CreateOrderCustomFieldDTO>(emptyForm);
  const [editingField, setEditingField] = useState<OrderCustomField | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrderCustomField | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sortedFields = useMemo(
    () => [...fields].sort((a, b) => a.displayOrder - b.displayOrder || a.fieldName.localeCompare(b.fieldName)),
    [fields],
  );

  const fetchFields = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderCustomFieldApi.getAllFields();
      setFields(data);
    } catch (err) {
      setError("納品登録項目の取得に失敗しました。バックエンドが起動しているか確認してください。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingField(null);
  };

  const startEdit = (field: OrderCustomField) => {
    setEditingField(field);
    setForm({
      fieldName: field.fieldName,
      fieldType: field.fieldType,
      required: field.required,
      displayOrder: field.displayOrder,
    });
  };

  const handleSubmit = async () => {
    const fieldName = form.fieldName.trim();
    if (!fieldName) {
      setError("項目名を入力してください");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = {
        ...form,
        fieldName,
        displayOrder: Number.isFinite(Number(form.displayOrder)) ? Number(form.displayOrder) : 0,
      };

      if (editingField) {
        await orderCustomFieldApi.updateField(editingField.id, payload);
        setSuccessMessage("納品登録項目を更新しました");
      } else {
        await orderCustomFieldApi.createField(payload);
        setSuccessMessage("納品登録項目を追加しました");
      }

      resetForm();
      await fetchFields();
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(err);
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
      await orderCustomFieldApi.deleteField(deleteTarget.id);
      setSuccessMessage("納品登録項目を削除しました");
      setDeleteTarget(null);
      await fetchFields();
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
            納品登録項目設定
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            注文名、顧客、優先度、ステータス、施工予定日、納期以外の入力項目を管理します。
          </Typography>
        </Box>
        <Button variant="outlined" onClick={fetchFields} disabled={loading} startIcon={<RefreshIcon />}>
          再読込
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={2.5}>
          <Typography component="h2" variant="h2">
            {editingField ? "項目を編集" : "項目を追加"}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                value={form.fieldName}
                onChange={(event) => setForm((current) => ({ ...current, fieldName: event.target.value }))}
                label="項目名"
                fullWidth
                required
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                value={form.fieldType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fieldType: event.target.value as OrderCustomFieldType,
                  }))
                }
                label="入力タイプ"
                select
                fullWidth
                disabled={saving}
              >
                {Object.values(OrderCustomFieldType).map((fieldType) => (
                  <MenuItem key={fieldType} value={fieldType}>
                    {fieldTypeLabels[fieldType]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                value={form.displayOrder}
                onChange={(event) =>
                  setForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))
                }
                label="表示順"
                type="number"
                fullWidth
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.required}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, required: event.target.checked }))
                    }
                    disabled={saving}
                  />
                }
                label="必須"
                sx={{ height: "100%", alignItems: "center", ml: 0 }}
              />
            </Grid>
          </Grid>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="flex-end">
            {editingField && (
              <Button variant="outlined" onClick={resetForm} disabled={saving}>
                キャンセル
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving}
              startIcon={saving ? <CircularProgress color="inherit" size={18} /> : editingField ? <SaveIcon /> : <AddCircleOutlineIcon />}
            >
              {saving ? "保存中" : editingField ? "更新する" : "追加する"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>表示順</TableCell>
                <TableCell>項目名</TableCell>
                <TableCell>入力タイプ</TableCell>
                <TableCell>必須</TableCell>
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
              ) : sortedFields.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">追加項目はまだありません</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedFields.map((field) => (
                  <TableRow hover key={field.id}>
                    <TableCell>{field.displayOrder}</TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>{field.fieldName}</Typography>
                    </TableCell>
                    <TableCell>{fieldTypeLabels[field.fieldType]}</TableCell>
                    <TableCell>{field.required ? "必須" : "任意"}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {new Date(field.updatedAt).toLocaleString("ja-JP")}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="編集">
                          <IconButton
                            aria-label={`${field.fieldName}を編集`}
                            onClick={() => startEdit(field)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="削除">
                          <IconButton
                            aria-label={`${field.fieldName}を削除`}
                            onClick={() => setDeleteTarget(field)}
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

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>項目を削除しますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget?.fieldName} を削除します。注文登録画面には表示されなくなります。
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
