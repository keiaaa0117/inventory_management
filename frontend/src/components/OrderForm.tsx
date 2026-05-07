import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormHelperText,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import { Customer, CreateOrderDTO, Order, Priority, Status } from "../types";
import { customerApi } from "../api/customerClient";
import { priorityLabels, statusLabels } from "../utils/orderDisplay";

const orderSchema = z
  .object({
    orderName: z
      .string()
      .trim()
      .min(1, "注文名は必須です")
      .min(3, "注文名は3文字以上で入力してください"),
    customerId: z.string().min(1, "顧客を選択してください"),
    memo: z.string().optional(),
    priority: z.nativeEnum(Priority),
    status: z.nativeEnum(Status),
    constructionDate: z.string().min(1, "施工予定日は必須です"),
    deliveryDate: z.string().min(1, "納期は必須です"),
  })
  .refine((data) => new Date(data.constructionDate) <= new Date(data.deliveryDate), {
    path: ["deliveryDate"],
    message: "納期は施工予定日以降の日付にしてください",
  });

type OrderFormInputs = z.infer<typeof orderSchema>;

interface OrderFormProps {
  initialData?: Order;
  onSubmit: (data: CreateOrderDTO) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "保存に失敗しました";
};

export function OrderForm({ initialData, onSubmit, isLoading = false, onCancel }: OrderFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultValues = useMemo<OrderFormInputs>(
    () => ({
      orderName: initialData?.orderName ?? "",
      customerId: initialData?.customerId ?? "",
      memo: initialData?.memo ?? "",
      priority: initialData?.priority ?? Priority.MEDIUM,
      status: initialData?.status ?? Status.PENDING,
      constructionDate: initialData?.constructionDate ?? "",
      deliveryDate: initialData?.deliveryDate ?? "",
    }),
    [initialData],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrderFormInputs>({
    resolver: zodResolver(orderSchema),
    defaultValues,
  });

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      setError(null);
      const data = await customerApi.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      setError("顧客一覧の取得に失敗しました。バックエンドが起動しているか確認してください。");
      console.error(err);
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    reset(defaultValues);
    setError(null);
    setSuccessMessage(null);
  }, [defaultValues, reset]);

  const handleFormSubmit = async (data: OrderFormInputs) => {
    try {
      setError(null);
      setSuccessMessage(null);
      await onSubmit(data);
      setSuccessMessage(initialData ? "注文を更新しました" : "注文を登録しました");
      reset(initialData ? data : defaultValues);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h1">
            {initialData ? "注文編集" : "新規注文登録"}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            顧客、優先度、施工予定日、納期を入力して注文を保存します。
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={7}>
            <Controller
              name="orderName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="注文名"
                  fullWidth
                  required
                  error={!!errors.orderName}
                  helperText={errors.orderName?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="顧客"
                  select
                  fullWidth
                  required
                  error={!!errors.customerId}
                  helperText={errors.customerId?.message}
                  disabled={isLoading || customersLoading || customers.length === 0}
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
              <FormHelperText sx={{ flexGrow: 1 }}>
                {customersLoading
                  ? "顧客一覧を読み込み中です"
                  : customers.length === 0
                    ? ""
                    : `${customers.length}件の顧客を選択できます`}
              </FormHelperText>
              <Button
                size="small"
                onClick={fetchCustomers}
                disabled={customersLoading}
                startIcon={<RefreshIcon fontSize="small" />}
              >
                再読込
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="優先度" select fullWidth disabled={isLoading}>
                  {Object.values(Priority).map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priorityLabels[priority]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="ステータス" select fullWidth disabled={isLoading}>
                  {Object.values(Status).map((status) => (
                    <MenuItem key={status} value={status}>
                      {statusLabels[status]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="constructionDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="施工予定日"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.constructionDate}
                  helperText={errors.constructionDate?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="deliveryDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="納期"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.deliveryDate}
                  helperText={errors.deliveryDate?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="memo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="メモ"
                  fullWidth
                  multiline
                  minRows={3}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="flex-end">
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel ?? (() => reset(defaultValues))}
            disabled={isLoading}
          >
            {onCancel ? "キャンセル" : "クリア"}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || customersLoading || customers.length === 0}
            startIcon={isLoading ? <CircularProgress color="inherit" size={18} /> : <SaveIcon />}
          >
            {isLoading ? "保存中" : initialData ? "更新する" : "登録する"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
