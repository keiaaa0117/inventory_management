import { useState } from "react";
import { Paper } from "@mui/material";
import { orderApi } from "../api/orderClient";
import { OrderForm } from "../components/OrderForm";
import { CreateOrderDTO } from "../types";

export function CreateOrderPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateOrderDTO) => {
    try {
      setIsLoading(true);
      await orderApi.createOrder(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, border: "1px solid", borderColor: "divider" }}>
      <OrderForm onSubmit={handleSubmit} isLoading={isLoading} />
    </Paper>
  );
}
