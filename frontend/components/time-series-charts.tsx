"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { getCityPollution24h } from "../lib/api" 

interface TimeSeriesChartsProps {
  data: Array<{
    timestamp: string
    pm25: number
    temperature: number
  }>,
  city: string
  state: string
  country: string
}

export function TimeSeriesCharts({ data, city, state, country }: TimeSeriesChartsProps) {
  let setData
  [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
      
        const currentCity = city
        const currentState = state
        const currentCountry = country

        const response = await getCityPollution24h(currentCity, currentState, currentCountry)

        const responseData = response.data 

        if (!responseData || !Array.isArray(responseData) || responseData.length === 0) {
          setError("Sem dados disponíveis (TESTE).")
          setLoading(false)
          return
        }

        setData(responseData)
        

      } catch (err) {
        console.error("Erro ao buscar dados da cidade:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
  }, [])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.getHours().toString().padStart(2, "0") + ":00"
  }

  const chartData = data.map((item) => ({
    time: formatTime(item.timestamp),
    pm25: item.pm25,
    pm10: item.pm10,
  }))
  

  if (loading)
    return <Card className="p-6">Carregando dados (Teste São Paulo)...</Card>
  if (error) return <Card className="p-6 text-red-600">{error}</Card>

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* --- GRÁFICO PM2.5 --- */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">PM2.5 nas últimas 24 horas</h3>
            <p className="text-sm text-muted-foreground">Concentração de partículas finas</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 25, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickMargin={6}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ value: "µg/m³", angle: -90, position: "insideLeft", offset: 5 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend verticalAlign="top" height={24} />
              <Line
                type="monotone"
                dataKey="pm25"
                name="PM2.5"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 2, strokeWidth: 1, fill: "#2563eb" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* --- GRÁFICO PM10 --- >*/}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">PM10 nas últimas 24 horas</h3>
            <p className="text-sm text-muted-foreground">Concentração de partículas maiores (com 10 micrômetros ou menos)</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 25, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickMargin={6}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ value: "µg/m³", angle: -90, position: "insideLeft", offset: 5 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend verticalAlign="top" height={24} />
              <Line
                type="monotone"
                dataKey="pm10"
                name="PM10"
                stroke="#0bf5b7ff"
                strokeWidth={2.5}
                dot={{ r: 2, strokeWidth: 1, fill: "#0bf5b7ff" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}