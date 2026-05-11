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
import { orderCustomFieldApi } from "../api/orderCustomFieldClient";
import {
  Customer,
  CreateOrderDTO,
  Order,
  OrderCustomField,
  OrderCustomFieldType,
  Priority,
  Status,
} from "../types";
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
    customFields: z.record(z.string()).optional(),
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

function FieldLabel({ children, required = false }: { children: string; required?: boolean }) {
  return (
    <Typography component="label" fontWeight={700} sx={{ display: "block", mb: 0.75 }}>
      {children}
      {required && (
        <Typography component="span" color="error" aria-hidden="true">
          {" *"}
        </Typography>
      )}
    </Typography>
  );
}

export function OrderForm({ initialData, onSubmit, isLoading = false, onCancel }: OrderFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customFields, setCustomFields] = useState<OrderCustomField[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customFieldsLoading, setCustomFieldsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultValues = useMemo<OrderFormInputs>(
    () => {
      const customFieldValues = Object.fromEntries(
        (initialData?.customFields ?? []).map((fieldValue) => [
          fieldValue.fieldId,
          fieldValue.value ?? "",
        ]),
      );

      return {
        orderName: initialData?.orderName ?? "",
        customerId: initialData?.customerId ?? "",
        memo: initialData?.memo ?? "",
        priority: initialData?.priority ?? Priority.MEDIUM,
        status: initialData?.status ?? Status.PENDING,
        constructionDate: initialData?.constructionDate ?? "",
        deliveryDate: initialData?.deliveryDate ?? "",
        customFields: customFieldValues,
      };
    },
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

  const fetchCustomFields = async () => {
    try {
      setCustomFieldsLoading(true);
      const data = await orderCustomFieldApi.getAllFields();
      setCustomFields(data);
    } catch (err) {
      setError("追加項目の取得に失敗しました。バックエンドが起動しているか確認してください。");
      console.error(err);
    } finally {
      setCustomFieldsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchCustomFields();
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
      const customFieldValues = customFields
        .map((field) => ({
          fieldId: field.id,
          value: data.customFields?.[field.id] ?? "",
        }))
        .filter((fieldValue) => fieldValue.value.trim().length > 0);

      const missingRequiredField = customFields.find(
        (field) => field.required && !(data.customFields?.[field.id] ?? "").trim(),
      );
      if (missingRequiredField) {
        setError(`${missingRequiredField.fieldName}は必須です`);
        return;
      }

      await onSubmit({
        ...data,
        customFields: customFieldValues,
      });
      setSuccessMessage(initialData ? "注文を更新しました" : "注文を登録しました");
      reset(initialData ? data : defaultValues);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(err);
    }
  };

  const getCustomFieldInputType = (fieldType: OrderCustomFieldType) => {
    switch (fieldType) {
      case OrderCustomFieldType.NUMBER:
        return "number";
      case OrderCustomFieldType.DATE:
        return "date";
      default:
        return "text";
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
                <Box>
                  <FieldLabel required>注文名</FieldLabel>
                  <TextField
                    {...field}
                    placeholder="注文名を入力"
                    fullWidth
                    error={!!errors.orderName}
                    helperText={errors.orderName?.message}
                    disabled={isLoading}
                  />
                </Box>
              )}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <Box>
                  <FieldLabel required>顧客</FieldLabel>
                  <TextField
                    {...field}
                    select
                    fullWidth
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
                </Box>
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
                <Box>
                  <FieldLabel required>優先度</FieldLabel>
                  <TextField {...field} select fullWidth disabled={isLoading}>
                    {Object.values(Priority).map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priorityLabels[priority]}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Box>
                  <FieldLabel required>ステータス</FieldLabel>
                  <TextField {...field} select fullWidth disabled={isLoading}>
                    {Object.values(Status).map((status) => (
                      <MenuItem key={status} value={status}>
                        {statusLabels[status]}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="constructionDate"
              control={control}
              render={({ field }) => (
                <Box>
                  <FieldLabel required>施工予定日</FieldLabel>
                  <TextField
                    {...field}
                    type="date"
                    fullWidth
                    error={!!errors.constructionDate}
                    helperText={errors.constructionDate?.message}
                    disabled={isLoading}
                  />
                </Box>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="deliveryDate"
              control={control}
              render={({ field }) => (
                <Box>
                  <FieldLabel required>納期</FieldLabel>
                  <TextField
                    {...field}
                    type="date"
                    fullWidth
                    error={!!errors.deliveryDate}
                    helperText={errors.deliveryDate?.message}
                    disabled={isLoading}
                  />
                </Box>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="memo"
              control={control}
              render={({ field }) => (
                <Box>
                  <FieldLabel>メモ</FieldLabel>
                  <TextField
                    {...field}
                    placeholder="メモを入力"
                    fullWidth
                    multiline
                    minRows={3}
                    disabled={isLoading}
                  />
                </Box>
              )}
            />
          </Grid>

          {customFields.length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                  <Typography component="h2" variant="h2">
                    追加項目
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                    納品登録項目設定で追加した項目です。
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={fetchCustomFields}
                  disabled={customFieldsLoading}
                  startIcon={<RefreshIcon fontSize="small" />}
                >
                  再読込
                </Button>
              </Stack>
              <Grid container spacing={2.5}>
                {customFields.map((field) => (
                  <Grid item xs={12} md={field.fieldType === OrderCustomFieldType.BOOLEAN ? 4 : 6} key={field.id}>
                    <Controller
                      name={`customFields.${field.id}`}
                      control={control}
                      rules={{
                        required: field.required ? `${field.fieldName}は必須です` : false,
                      }}
                      render={({ field: formField, fieldState }) =>
                        field.fieldType === OrderCustomFieldType.BOOLEAN ? (
                          <Box>
                            <FieldLabel required={field.required}>{field.fieldName}</FieldLabel>
                            <TextField
                              {...formField}
                              value={formField.value ?? ""}
                              select
                              fullWidth
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              disabled={isLoading}
                            >
                              <MenuItem value="">未選択</MenuItem>
                              <MenuItem value="true">はい</MenuItem>
                              <MenuItem value="false">いいえ</MenuItem>
                            </TextField>
                          </Box>
                        ) : (
                          <Box>
                            <FieldLabel required={field.required}>{field.fieldName}</FieldLabel>
                            <TextField
                              {...formField}
                              value={formField.value ?? ""}
                              placeholder={`${field.fieldName}を入力`}
                              type={getCustomFieldInputType(field.fieldType)}
                              fullWidth
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              disabled={isLoading}
                            />
                          </Box>
                        )
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
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
