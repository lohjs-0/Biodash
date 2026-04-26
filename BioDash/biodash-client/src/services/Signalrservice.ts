import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '../store/authStore'
import type { Reading } from '../types'

let connection: signalR.HubConnection | null = null

export function getConnection(): signalR.HubConnection {
  if (!connection) {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:5071'
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/tanks`, {
        accessTokenFactory: () => useAuthStore.getState().token ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()
  }
  return connection
}

export async function startConnection() {
  const conn = getConnection()
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    await conn.start()
  }
}

export async function stopConnection() {
  if (connection?.state === signalR.HubConnectionState.Connected) {
    await connection.stop()
  }
}

export async function joinTank(tankId: number) {
  await startConnection()
  await getConnection().invoke('JoinTank', String(tankId))
}

export async function leaveTank(tankId: number) {
  const conn = getConnection()
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke('LeaveTank', String(tankId))
  }
}

export function onNewReading(handler: (reading: Reading) => void) {
  getConnection().on('NewReading', handler)
}

export function offNewReading(handler: (reading: Reading) => void) {
  getConnection().off('NewReading', handler)
}