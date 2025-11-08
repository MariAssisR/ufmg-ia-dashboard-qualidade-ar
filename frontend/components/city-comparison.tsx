"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useEffect, useState } from "react"

interface CityComparisonProps {
  currentCity: string
  // current city PM2.5 value supplied by parent (if available)
  currentPm25?: number | null
  // optional list of cities to show
  cities?: string[]
}

export function CityComparison({ currentCity, currentPm25, cities }: CityComparisonProps) {
  // Default simulated list used until backend is available
  const DEFAULT_CITIES = [
    { city: "São Paulo", pm25: 45, color: "hsl(var(--warning))" },
    { city: "Rio de Janeiro", pm25: 32, color: "hsl(var(--warning))" },
    { city: "Belo Horizonte", pm25: 28, color: "hsl(var(--warning))" },
    { city: "Brasília", pm25: 18, color: "hsl(var(--success))" },
    { city: "Curitiba", pm25: 22, color: "hsl(var(--success))" },
    { city: "Porto Alegre", pm25: 38, color: "hsl(var(--warning))" },
  ]

  const [comparisonData, setComparisonData] = useState(DEFAULT_CITIES)

  // Example: how to load current PM2.5 for all cities from backend (commented out until backend is ready)
  /*
  useEffect(() => {
    async function loadComparison() {
      try {
        // Option A: If backend provides a /cities endpoint
        const citiesRes = await fetch('http://localhost:8000/cities')
        const citiesList: string[] = await citiesRes.json()

        const results = await Promise.all(
          citiesList.map(async (city) => {
            const res = await fetch(`http://localhost:8000/cities/${encodeURIComponent(city)}/current`)
            const current = await res.json()
            return {
              city,
              pm25: current.pm25 ?? current.pm2_5 ?? null,
              color: 'hsl(var(--warning))',
            }
          })
        )

        setComparisonData(results)
      } catch (err) {
        console.error('Error loading comparison data:', err)
      }
    }
    loadComparison()
  }, [])
  */

  // If parent supplies cities list, ensure we show them (keep simulated pm25 values until backend ready)
  const baseData = comparisonData

  // If parent supplied a real current value for the selected city, override that bar value so the chart picks it up.
  const displayedData = baseData.map((entry) =>
    entry.city === currentCity && typeof currentPm25 === 'number' ? { ...entry, pm25: currentPm25 } : entry
  )

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Comparação entre cidades</h3>
          <p className="text-sm text-muted-foreground">Níveis atuais de PM2.5 em diferentes cidades brasileiras</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={displayedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="city"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: "PM2.5 (µg/m³)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="pm25" radius={[8, 8, 0, 0]}>
              {displayedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.city === currentCity ? "hsl(var(--primary))" : entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
