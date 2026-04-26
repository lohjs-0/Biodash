export interface User {
  id: number
  email: string
  name: string
  organization: string
}

export interface Tank {
  id: number
  name: string
  description: string
  volumeLiters: number
  currentLevel: number
  currentTemperature: number
  currentPh: number
  isOnline: boolean
  alertActive: boolean
  createdAt: string
}

export interface Reading {
  id: number
  tankId: number
  level: number
  temperature: number
  ph: number
  recordedAt: string
}

export interface ReadingHistory {
  avgLevel: number
  avgTemperature: number
  avgPh: number
  maxTemperature: number
  minTemperature: number
  maxPh: number
  minPh: number
  totalReadings: number
}

export interface AlertRule {
  id: number
  tankId: number
  parameter: 'level' | 'temperature' | 'ph'
  minValue: number
  maxValue: number
}

export interface UserMetrics {
  totalTanks: number
  onlineTanks: number
  alertsToday: number
  avgTemperature: number
  avgPh: number
  avgLevel: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  organization: string
}

export interface AuthResponse {
  token: string
  user: User
}