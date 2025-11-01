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

export default function AirQualityDashboard() {
  const [selectedCity, setSelectedCity] = useState("São Paulo")
  const [airQualityData, setAirQualityData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchAirQualityData = async () => {
    setLoading(true)
    // Simulating API call - replace with actual backend endpoint
    setTimeout(() => {
      setAirQualityData({
        city: selectedCity,
        current: {
          pm25: Math.random() * 100,
          temperature: 20 + Math.random() * 15,
          humidity: 40 + Math.random() * 40,
          timestamp: new Date().toISOString(),
        },
        historical: generateHistoricalData(),
      })
      setLoading(false)
    }, 1000)
  }

  useEffect(() => {
    fetchAirQualityData()
  }, [selectedCity])

  const generateHistoricalData = () => {
    const data = []
    for (let i = 23; i >= 0; i--) {
      const date = new Date()
      date.setHours(date.getHours() - i)
      data.push({
        timestamp: date.toISOString(),
        pm25: 20 + Math.random() * 60,
        temperature: 18 + Math.random() * 12,
      })
    }
    return data
  }

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
            <Button onClick={fetchAirQualityData} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar dados
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />

          {airQualityData && (
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
