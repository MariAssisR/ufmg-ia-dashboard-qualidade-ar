"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { getCurrentCityData } from "../lib/api"

interface HealthAlertProps {
  data: {
    pm25: number
  }
}

export function HealthAlert({ data: _data }: HealthAlertProps) {
  const [data, setData] = useState(_data)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    if (_data) return
    setLoading(true)
    getCurrentCityData("São Paulo", "São Paulo", "Brazil")
      .then(res => { setData(res); setLoading(false) })
      .catch(err => { setError("Erro ao buscar alerta de saúde: "+err); setLoading(false) })
  }, [])

  if (loading) return <div>Carregando alerta de saúde...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return null

  const getAlertInfo = (pm25: number) => {
    if (pm25 <= 12) {
      return {
        show: false,
        variant: "default" as const,
        icon: CheckCircle,
        title: "Qualidade do ar boa",
        description: "O ar está limpo e saudável para todos.",
      }
    }
    if (pm25 <= 35) {
      return {
        show: true,
        variant: "default" as const,
        icon: AlertCircle,
        title: "Qualidade do ar moderada",
        description:
          "A qualidade do ar é aceitável. Pessoas extremamente sensíveis devem considerar limitar atividades ao ar livre prolongadas.",
      }
    }
    if (pm25 <= 55) {
      return {
        show: true,
        variant: "default" as const,
        icon: AlertTriangle,
        title: "Atenção: Insalubre para grupos sensíveis",
        description:
          "Crianças, idosos e pessoas com problemas respiratórios devem evitar atividades prolongadas ao ar livre.",
      }
    }
    return {
      show: true,
      variant: "destructive" as const,
      icon: AlertTriangle,
      title: "Alerta: Risco à saúde elevado",
      description:
        "A qualidade do ar está insalubre. Todos devem evitar atividades ao ar livre e manter janelas fechadas.",
    }
  }

  const alert = getAlertInfo(data.pm25)
  const Icon = alert.icon

  if (!alert.show && data.pm25 <= 12) {
    return null
  }

  return (
    <Alert
      variant={alert.variant}
      className={data.pm25 > 55 ? "border-danger bg-danger/10" : data.pm25 > 35 ? "border-warning bg-warning/10" : ""}
    >
      <Icon className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold">{alert.title}</AlertTitle>
      <AlertDescription className="text-sm leading-relaxed">{alert.description}</AlertDescription>
    </Alert>
  )
}
