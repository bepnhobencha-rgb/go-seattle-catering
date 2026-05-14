import type { Lang } from "./i18n";

export const ROLE = { CUSTOMER: "CUSTOMER", ADMIN: "ADMIN" } as const;

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const ORDER_STATUS_LABEL_EN: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready for pickup",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
const ORDER_STATUS_LABEL_VN: Record<OrderStatus, string> = {
  PENDING: "Đang chờ",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  READY: "Sẵn sàng lấy",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã huỷ",
};
/** Backwards-compatible default (English). */
export const ORDER_STATUS_LABEL = ORDER_STATUS_LABEL_EN;

export function orderStatusLabel(s: OrderStatus, lang: Lang = "en") {
  return (lang === "vn" ? ORDER_STATUS_LABEL_VN : ORDER_STATUS_LABEL_EN)[s];
}

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  CONFIRMED: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  PREPARING: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  READY: "bg-green-500/20 text-green-300 border-green-500/40",
  COMPLETED: "bg-gold-500/15 text-gold-200 border-gold-500/40",
  CANCELLED: "bg-red-500/20 text-red-300 border-red-500/40",
};

export const EVENT_TYPES = [
  "WEDDING",
  "PRIVATE_PARTY",
  "CORPORATE",
  "FAMILY",
  "OTHER",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

const EVENT_TYPE_LABEL_EN: Record<EventType, string> = {
  WEDDING: "Wedding",
  PRIVATE_PARTY: "Private Party",
  CORPORATE: "Corporate Event",
  FAMILY: "Family Gathering",
  OTHER: "Other",
};
const EVENT_TYPE_LABEL_VN: Record<EventType, string> = {
  WEDDING: "Đám cưới",
  PRIVATE_PARTY: "Tiệc riêng",
  CORPORATE: "Sự kiện doanh nghiệp",
  FAMILY: "Tiệc gia đình",
  OTHER: "Khác",
};
export const EVENT_TYPE_LABEL = EVENT_TYPE_LABEL_EN;

export function eventTypeLabel(et: EventType, lang: Lang = "en") {
  return (lang === "vn" ? EVENT_TYPE_LABEL_VN : EVENT_TYPE_LABEL_EN)[et];
}

export const SERVICE_STYLES = ["BUFFET", "PLATED", "DROPOFF"] as const;
export type ServiceStyle = (typeof SERVICE_STYLES)[number];

const SERVICE_STYLE_LABEL_EN: Record<ServiceStyle, string> = {
  BUFFET: "Buffet",
  PLATED: "Plated",
  DROPOFF: "Drop-off",
};
const SERVICE_STYLE_LABEL_VN: Record<ServiceStyle, string> = {
  BUFFET: "Buffet",
  PLATED: "Set bàn",
  DROPOFF: "Giao tận nơi",
};
export const SERVICE_STYLE_LABEL = SERVICE_STYLE_LABEL_EN;

export function serviceStyleLabel(s: ServiceStyle, lang: Lang = "en") {
  return (lang === "vn" ? SERVICE_STYLE_LABEL_VN : SERVICE_STYLE_LABEL_EN)[s];
}

export const REQUEST_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUOTED",
  "BOOKED",
  "COMPLETED",
  "DECLINED",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

const REQUEST_STATUS_LABEL_EN: Record<RequestStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUOTED: "Quoted",
  BOOKED: "Booked",
  COMPLETED: "Completed",
  DECLINED: "Declined",
};
const REQUEST_STATUS_LABEL_VN: Record<RequestStatus, string> = {
  NEW: "Mới",
  CONTACTED: "Đã liên hệ",
  QUOTED: "Đã báo giá",
  BOOKED: "Đã đặt",
  COMPLETED: "Hoàn tất",
  DECLINED: "Từ chối",
};
export const REQUEST_STATUS_LABEL = REQUEST_STATUS_LABEL_EN;

export function requestStatusLabel(s: RequestStatus, lang: Lang = "en") {
  return (lang === "vn" ? REQUEST_STATUS_LABEL_VN : REQUEST_STATUS_LABEL_EN)[s];
}

export const REQUEST_STATUS_COLOR: Record<RequestStatus, string> = {
  NEW: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  CONTACTED: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  QUOTED: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  BOOKED: "bg-green-500/20 text-green-300 border-green-500/40",
  COMPLETED: "bg-gold-500/15 text-gold-200 border-gold-500/40",
  DECLINED: "bg-red-500/20 text-red-300 border-red-500/40",
};

export const BUDGET_RANGES = [
  "Under $1,000",
  "$1,000 – $3,000",
  "$3,000 – $5,000",
  "$5,000 – $10,000",
  "$10,000+",
] as const;
