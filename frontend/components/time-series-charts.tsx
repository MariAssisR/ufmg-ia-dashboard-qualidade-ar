"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TimeSeriesChartsProps {
  data: Array<{
    timestamp: string
    pm25: number
    temperature: number
  }>
}

export function TimeSeriesCharts({ data }: TimeSeriesChartsProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.getHours().toString().padStart(2, "0") + ":00"
  }

  // Ensure values are numbers (or null) so Recharts can render correctly.
  // Recharts will break lines when values are undefined; using `null` with `connectNulls` fixes that.
  const toNumberOrNull = (v: any) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }

  const chartData = data.map((item) => ({
    time: formatTime(item.timestamp),
    pm25: toNumberOrNull(item.pm25),
    temperature: toNumberOrNull(item.temperature),
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">PM2.5 nas últimas 24 horas</h3>
            <p className="text-sm text-muted-foreground">Concentração de partículas finas</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ value: "µg/m³", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="pm25"
                // light grey connecting line
                stroke="#e5e7eb"
                strokeWidth={2}
                connectNulls
                // keep individual dots colored to the series
                dot={{ r: 3, stroke: 'hsl(var(--primary))', fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Temperatura nas últimas 24 horas</h3>
            <p className="text-sm text-muted-foreground">Variação da temperatura</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ value: "°C", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                // light grey connecting line
                stroke="#e5e7eb"
                strokeWidth={2}
                connectNulls
                dot={{ r: 3, stroke: 'hsl(var(--chart-2))', fill: 'hsl(var(--chart-2))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
