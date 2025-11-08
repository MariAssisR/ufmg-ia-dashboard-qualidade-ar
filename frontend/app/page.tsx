"use client"

import { useState, useEffect } from "react"
import { CitySelector } from "@/components/city-selector"
import { AirQualityIndicators } from "@/components/air-quality-indicators"
import { TimeSeriesCharts } from "@/components/time-series-charts"
import { HealthAlert } from "@/components/health-alert"
import { CityComparison } from "@/components/city-comparison"
import { ReportGenerator } from "@/components/report-generator"
import { Button } from "@/components/ui/button"
import { RefreshCw, Wind } from "lucide-react"
import { getCurrentCityData, getCityHistory } from "../lib/api"

const CIDADE_PARA_ESTADO: Record<string, string> = {
  "São Paulo": "São Paulo",
  "Rio de Janeiro": "Rio de Janeiro",
  "Curitiba": "Parana",
  "Porto Alegre": "Rio Grande do Sul",
};

export default function AirQualityDashboard() {
  const [selectedCity, setSelectedCity] = useState("São Paulo")
  const [airQualityData, setAirQualityData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const fetchAirQualityData = async (city = selectedCity) => {
    setLoading(true)
    setError(null)
    try {
      // Primeiro busca o histórico p/ extrair estado correto
      const historyResp = await getCityHistory(city, 24)
      let estado = (historyResp.data && historyResp.data[0]?.state) || CIDADE_PARA_ESTADO[city] || ""
      // Busque os dados atuais apenas se o estado está preenchido
      const current = estado ? await getCurrentCityData(city, estado, "Brazil") : { pm25: undefined, temperature: undefined, humidity: undefined }
      setAirQualityData({
        city,
        current: current, // já está {pm25, temperature, humidity, ...}
        historical: (historyResp.data || []).map((d:any) => ({
          timestamp: d.timestamp, 
          pm25: Number(d.pm25), 
          temperature: Number(d.temperature)
        }))
      })
    } catch(err:any) {
      setError("Erro ao carregar dados da cidade: "+(err?.message || err))
      setAirQualityData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAirQualityData(selectedCity)
  }, [selectedCity])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Wind className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-balance">Dashboard de Qualidade do Ar</h1>
                <p className="text-sm text-muted-foreground">Monitoramento em tempo real</p>
              </div>
            </div>
            <Button onClick={() => fetchAirQualityData(selectedCity)} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar dados
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
          {error && (<div className="p-4 text-red-600 bg-red-50 rounded">{error}</div>)}
          {loading && (<div className="p-4">Carregando dados da cidade...</div>)}

          {airQualityData && !loading && (
            <>
              <HealthAlert data={airQualityData.current} />
              <AirQualityIndicators data={airQualityData.current} />
              <TimeSeriesCharts data={airQualityData.historical} />
              <CityComparison currentCity={selectedCity} />
              <ReportGenerator city={selectedCity} data={airQualityData} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
