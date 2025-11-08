"use client"

import { Card } from "@/components/ui/card"
import { Thermometer, Droplets, Wind } from "lucide-react"

interface AirQualityIndicatorsProps {
  data: {
    pm25: number
    temperature: number
    humidity: number
  }
}

export function AirQualityIndicators({ data }: AirQualityIndicatorsProps) {
  const getAirQualityLevel = (pm25: number) => {
    if (pm25 <= 12) return { level: "Bom", color: "success", description: "Qualidade do ar excelente" }
    if (pm25 <= 35) return { level: "Moderado", color: "warning", description: "Qualidade do ar aceitável" }
    if (pm25 <= 55)
      return {
        level: "Insalubre para grupos sensíveis",
        color: "warning",
        description: "Grupos sensíveis devem ter cuidado",
      }
    return { level: "Insalubre", color: "danger", description: "Risco à saúde elevado" }
  }

  const airQuality = getAirQualityLevel(data.pm25)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className={`p-6 border-2 border-${airQuality.color}`}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Nível de Poluição</span>
            <Wind className={`h-5 w-5 text-${airQuality.color}`} />
          </div>
          <div className={`text-3xl font-bold text-${airQuality.color}`}>{airQuality.level}</div>
          <p className="text-xs text-muted-foreground">{airQuality.description}</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">PM2.5</span>
            <div className={`h-3 w-3 rounded-full bg-${airQuality.color}`} />
          </div>
          <div className="text-3xl font-bold text-foreground">{data.pm25.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">µg/m³</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Temperatura</span>
            <Thermometer className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{data.temperature.toFixed(1)}°C</div>
          <p className="text-xs text-muted-foreground">Temperatura atual</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Umidade</span>
            <Droplets className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{data.humidity.toFixed(0)}%</div>
          <p className="text-xs text-muted-foreground">Umidade relativa</p>
        </div>
      </Card>
    </div>
  )
}
