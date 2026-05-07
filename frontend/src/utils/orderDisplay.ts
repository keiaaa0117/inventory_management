import { Priority, Status } from "../types";

export const priorityLabels: Record<Priority, string> = {
  [Priority.LOW]: "低",
  [Priority.MEDIUM]: "中",
  [Priority.HIGH]: "高",
};

export const statusLabels: Record<Status, string> = {
  [Status.PENDING]: "受注待ち",
  [Status.WORKING]: "施工中",
  [Status.COMPLETED]: "完了",
};

export const priorityColors: Record<Priority, "default" | "warning" | "error"> = {
  [Priority.LOW]: "default",
  [Priority.MEDIUM]: "warning",
  [Priority.HIGH]: "error",
};

export const statusColors: Record<Status, "default" | "info" | "success"> = {
  [Status.PENDING]: "default",
  [Status.WORKING]: "info",
  [Status.COMPLETED]: "success",
};

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDate = (value?: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
};

export const formatDateTime = (value?: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
};
