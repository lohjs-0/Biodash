import client from "./client";
import type {
  AlertRule,
  Reading,
  ReadingHistory,
  Tank,
  UserMetrics,
} from "../types";

export const tanksApi = {
  getAll: () => client.get<Tank[]>("/tanks").then((r) => r.data),

  getById: (id: number) => client.get<Tank>(`/tanks/${id}`).then((r) => r.data),

  create: (data: Partial<Tank>) =>
    client.post<Tank>("/tanks", data).then((r) => r.data),

  update: (id: number, data: Partial<Tank>) =>
    client.put<Tank>(`/tanks/${id}`, data).then((r) => r.data),

  delete: (id: number) => client.delete(`/tanks/${id}`),

  toggleOnline: (id: number) => client.patch(`/tanks/${id}/toggle`),

  getReadings: (id: number, hours = 24) =>
    client
      .get<Reading[]>(`/tanks/${id}/readings?hours=${hours}`)
      .then((r) => r.data),

  getReadingHistory: (id: number, hours = 24) =>
    client
      .get<ReadingHistory>(`/tanks/${id}/readings/history?hours=${hours}`)
      .then((r) => r.data),

  getAlertRules: (id: number) =>
    client.get<AlertRule[]>(`/tanks/${id}/alerts`).then((r) => r.data),

  createAlertRule: (tankId: number, data: Omit<AlertRule, "id" | "tankId">) =>
    client.post<AlertRule>(`/tanks/${tankId}/alerts`, data).then((r) => r.data),

  updateAlertRule: (
    tankId: number,
    ruleId: number,
    data: { minValue: number; maxValue: number },
  ) =>
    client
      .put<AlertRule>(`/tanks/${tankId}/alerts/${ruleId}`, data)
      .then((r) => r.data),

  deleteAlertRule: (tankId: number, ruleId: number) =>
    client.delete(`/tanks/${tankId}/alerts/${ruleId}`),

  getMetrics: () => client.get<UserMetrics>("/metrics").then((r) => r.data),
};
