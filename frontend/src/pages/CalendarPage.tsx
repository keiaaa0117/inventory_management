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
  DialogTitle,
  Divider,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListAltIcon from "@mui/icons-material/ListAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import TodayIcon from "@mui/icons-material/Today";
import {
  Calendar,
  dateFnsLocalizer,
  NavigateAction,
  ToolbarProps,
  View,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { addDays, format, getDay, parse, startOfWeek } from "date-fns";
import { ja } from "date-fns/locale";
import { Link as RouterLink } from "react-router-dom";
import { orderApi } from "../api/orderClient";
import { Order, Status } from "../types";
import {
  formatDate,
  priorityColors,
  priorityLabels,
  statusColors,
  statusLabels,
} from "../utils/orderDisplay";
import "./calendarPage.css";

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  order: Order;
};

const allStatuses = "ALL";
const calendarViews: View[] = ["month", "week", "day", "agenda"];
const locales = { ja };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: ja }),
  getDay,
  locales,
});

const viewLabels: Record<View, string> = {
  month: "月",
  week: "週",
  work_week: "稼働週",
  day: "日",
  agenda: "予定",
};

const messages = {
  allDay: "終日",
  previous: "前へ",
  next: "次へ",
  today: "今日",
  month: "月",
  week: "週",
  day: "日",
  agenda: "予定",
  date: "日付",
  time: "時間",
  event: "注文",
  noEventsInRange: "この期間に表示できる注文はありません",
  showMore: (count: number) => `他 ${count}件`,
};

const formats = {
  monthHeaderFormat: (date: Date) => format(date, "yyyy年M月", { locale: ja }),
  dayHeaderFormat: (date: Date) => format(date, "M月d日 EEEE", { locale: ja }),
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, "M月d日", { locale: ja })} - ${format(end, "M月d日", { locale: ja })}`,
  agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, "yyyy年M月d日", { locale: ja })} - ${format(end, "M月d日", {
      locale: ja,
    })}`,
  weekdayFormat: (date: Date) => format(date, "E", { locale: ja }),
  dateFormat: (date: Date) => format(date, "d", { locale: ja }),
};

const toLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "カレンダー情報の取得に失敗しました";
};

function CalendarToolbar({ label, view, onNavigate, onView }: ToolbarProps<CalendarEvent>) {
  const handleNavigate = (action: NavigateAction) => {
    onNavigate(action);
  };

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1.5}
      alignItems={{ xs: "stretch", md: "center" }}
      justifyContent="space-between"
      className="calendar-toolbar"
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleNavigate("TODAY")}
          startIcon={<TodayIcon />}
        >
          今日
        </Button>
        <Button
          variant="outlined"
          size="small"
          aria-label="前の期間"
          onClick={() => handleNavigate("PREV")}
        >
          <ChevronLeftIcon fontSize="small" />
        </Button>
        <Button
          variant="outlined"
          size="small"
          aria-label="次の期間"
          onClick={() => handleNavigate("NEXT")}
        >
          <ChevronRightIcon fontSize="small" />
        </Button>
        <Typography component="h2" variant="h2" sx={{ ml: { md: 1 } }}>
          {label}
        </Typography>
      </Stack>

      <ToggleButtonGroup
        exclusive
        size="small"
        value={view}
        onChange={(_, nextView: View | null) => {
          if (nextView) {
            onView(nextView);
          }
        }}
      >
        {calendarViews.map((calendarView) => (
          <ToggleButton key={calendarView} value={calendarView}>
            {viewLabels[calendarView]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}

function CalendarEventLabel({ event }: { event: CalendarEvent }) {
  return (
    <Box className="calendar-event-label">
      <span className="calendar-event-title">{event.title}</span>
      <span className="calendar-event-customer">{event.order.customerName}</span>
    </Box>
  );
}

export function CalendarPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | typeof allStatuses>(allStatuses);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getAllOrders();
      setOrders(data);
    } catch (err) {
      setError(getErrorMessage(err));
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

  const events = useMemo<CalendarEvent[]>(
    () =>
      filteredOrders.map((order) => {
        const start = toLocalDate(order.constructionDate);
        const deliveryDate = toLocalDate(order.deliveryDate);

        return {
          id: order.id,
          title: order.orderName,
          start,
          end: addDays(deliveryDate, 1),
          allDay: true,
          order,
        };
      }),
    [filteredOrders],
  );

  const highPriorityCount = filteredOrders.filter((order) => order.priority === "HIGH").length;
  const workingCount = filteredOrders.filter((order) => order.status === "WORKING").length;

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
            カレンダー
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            注文の施工予定日から納期までをカレンダーで確認します
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            onClick={fetchOrders}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : <RefreshIcon />}
          >
            再読込
          </Button>
          <Button
            component={RouterLink}
            to="/orders"
            variant="outlined"
            startIcon={<ListAltIcon />}
          >
            注文一覧
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

      <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
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

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
          <Chip icon={<CalendarMonthIcon />} label={`表示中 ${filteredOrders.length}件`} />
          <Chip color="info" label={`施工中 ${workingCount}件`} />
          <Chip color="error" label={`高優先 ${highPriorityCount}件`} />
          {Object.values(Status).map((status) => (
            <Chip
              key={status}
              color={statusColors[status]}
              label={statusLabels[status]}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1, md: 2 },
          border: "1px solid",
          borderColor: "divider",
          minHeight: { xs: 640, md: 760 },
        }}
      >
        <Box className="inventory-calendar">
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 520 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <Calendar<CalendarEvent>
              culture="ja"
              localizer={localizer}
              events={events}
              date={date}
              view={view}
              views={calendarViews}
              startAccessor="start"
              endAccessor="end"
              allDayAccessor="allDay"
              titleAccessor="title"
              messages={messages}
              formats={formats}
              popup
              showAllEvents
              components={{
                toolbar: CalendarToolbar,
                event: CalendarEventLabel,
              }}
              eventPropGetter={(event) => ({
                className: `status-${event.order.status.toLowerCase()} priority-${event.order.priority.toLowerCase()}`,
              })}
              onNavigate={(nextDate) => setDate(nextDate)}
              onView={(nextView) => setView(nextView)}
              onSelectEvent={(event) => setSelectedEvent(event)}
              style={{ minHeight: 700 }}
            />
          )}
        </Box>
      </Paper>

      <Dialog open={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)} fullWidth maxWidth="sm">
        <DialogTitle>{selectedEvent?.order.orderName}</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  color={statusColors[selectedEvent.order.status]}
                  label={statusLabels[selectedEvent.order.status]}
                />
                <Chip
                  color={priorityColors[selectedEvent.order.priority]}
                  label={`優先度 ${priorityLabels[selectedEvent.order.priority]}`}
                  variant={selectedEvent.order.priority === "LOW" ? "outlined" : "filled"}
                />
              </Stack>
              <Divider />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  顧客
                </Typography>
                <Typography>{selectedEvent.order.customerName}</Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2">
                  期間
                </Typography>
                <Typography>
                  {formatDate(selectedEvent.order.constructionDate)} -{" "}
                  {formatDate(selectedEvent.order.deliveryDate)}
                </Typography>
              </Box>
              {selectedEvent.order.memo && (
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    メモ
                  </Typography>
                  <Typography sx={{ whiteSpace: "pre-wrap" }}>{selectedEvent.order.memo}</Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedEvent(null)}>閉じる</Button>
          {selectedEvent && (
            <Button component={RouterLink} to="/orders" variant="contained">
              一覧で編集
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
