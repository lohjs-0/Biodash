import client from "./client";
import type { UserMetrics } from "../types";

export const metricsApi = {
  get: () => client.get<UserMetrics>("/metrics").then((r) => r.data),
};
