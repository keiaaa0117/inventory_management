import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { CreateCustomerDTO, Customer } from "../types";

const customerSchema = z.object({
  name: z.string().trim().min(1, "顧客名は必須です").min(2, "顧客名は2文字以上で入力してください"),
  contactInfo: z.string().optional(),
  memo: z.string().optional(),
});

type CustomerFormInputs = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Customer;
  isLoading?: boolean;
  onCancel?: () => void;
  onSubmit: (data: CreateCustomerDTO) => Promise<void>;
}

export function CustomerForm({
  initialData,
  isLoading = false,
  onCancel,
  onSubmit,
}: CustomerFormProps) {
  const defaultValues = useMemo<CustomerFormInputs>(
    () => ({
      name: initialData?.name ?? "",
      contactInfo: initialData?.contactInfo ?? "",
      memo: initialData?.memo ?? "",
    }),
    [initialData],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerFormInputs>({
    resolver: zodResolver(customerSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const handleFormSubmit = async (data: CustomerFormInputs) => {
    await onSubmit({
      name: data.name.trim(),
      contactInfo: data.contactInfo?.trim(),
      memo: data.memo?.trim(),
    });

    if (!initialData) {
      reset(defaultValues);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h1">
            {initialData ? "顧客編集" : "顧客登録"}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            注文登録で選択する顧客情報を管理します。
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="顧客名"
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="contactInfo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="連絡先"
                  placeholder="電話番号・メール・担当者など"
                  fullWidth
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
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress color="inherit" size={18} /> : <SaveIcon />}
          >
            {isLoading ? "保存中" : initialData ? "更新する" : "登録する"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
