"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { getAllHistory } from "../lib/api"

interface CityComparisonProps {
  currentCity: string
}

export function CityComparison({ currentCity }: CityComparisonProps) {
  const [comparisonData, setComparisonData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getAllHistory(1) // busca dados da última hora para dados "atuais"
      .then((data) => {
        // Agrupa por cidade e pega o último registro de cada uma
        const cityGroups: Record<string, any[]> = {}
        if (!data.data) return setError('Dados não disponíveis no backend!')
        data.data.forEach((item: any) => {
          if (!cityGroups[item.city]) cityGroups[item.city] = []
          cityGroups[item.city].push(item)
        })
        const lastByCity = Object.entries(cityGroups).map(([city, group]) => {
          const last = group[group.length - 1]
          return {
            city,
            pm25: Number(last.pm25),
            color: Number(last.pm25) <= 20 ? "hsl(var(--success))" : "hsl(var(--warning))"
          }
        })
        setComparisonData(lastByCity)
        setLoading(false)
      })
      .catch((err) => {
        setError('Erro ao carregar dados das cidades: '+err)
        setLoading(false)
      })
  }, [])

  if(loading) return <Card className="p-6">Carregando comparação entre cidades...</Card>
  if(error) return <Card className="p-6 text-red-600">{error}</Card>

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
