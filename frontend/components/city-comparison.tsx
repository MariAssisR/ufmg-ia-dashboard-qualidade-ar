"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface CityComparisonProps {
  currentCity: string
}

export function CityComparison({ currentCity }: CityComparisonProps) {
  // Simulated data - replace with actual API call
  const comparisonData = [
    { city: "São Paulo", pm25: 45, color: "hsl(var(--warning))" },
    { city: "Rio de Janeiro", pm25: 32, color: "hsl(var(--warning))" },
    { city: "Belo Horizonte", pm25: 28, color: "hsl(var(--warning))" },
    { city: "Brasília", pm25: 18, color: "hsl(var(--success))" },
    { city: "Curitiba", pm25: 22, color: "hsl(var(--success))" },
    { city: "Porto Alegre", pm25: 38, color: "hsl(var(--warning))" },
  ]

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Comparação entre cidades</h3>
          <p className="text-sm text-muted-foreground">Níveis atuais de PM2.5 em diferentes cidades brasileiras</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={comparisonData}>
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
              {comparisonData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.city === currentCity ? "hsl(var(--primary))" : entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
