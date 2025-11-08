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
  // List of cities (can be loaded from backend). Kept default values for now.
  const [cities, setCities] = useState<string[]>([
    "São Paulo",
    "Rio de Janeiro",
    "Belo Horizonte",
    "Brasília",
    "Curitiba",
    "Porto Alegre",
    "Salvador",
    "Fortaleza",
  ])
  const [airQualityData, setAirQualityData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Example: how to load cities from a local backend (commented out until backend is ready)
  /*
  useEffect(() => {
    async function loadCities() {
      try {
        const res = await fetch('http://localhost:8000/cities')
        if (!res.ok) throw new Error('Failed to fetch cities')
        const data = await res.json()
        setCities(data)
      } catch (err) {
        console.error('Error loading cities:', err)
      }
    }
    loadCities()
  }, [])
  */

  const fetchAirQualityData = async () => {
    setLoading(true)
    // Real backend calls (commented) - replace endpoints as necessary
    /*
    try {
      const currentRes = await fetch(`http://localhost:8000/cities/${encodeURIComponent(selectedCity)}/current`)
      const current = await currentRes.json()

      const tempRes = await fetch(`http://localhost:8000/cities/${encodeURIComponent(selectedCity)}/temperature/24h`)
      const temperatures = await tempRes.json() // expected: [{ timestamp, value | temperature }, ...]

      const pmRes = await fetch(`http://localhost:8000/cities/${encodeURIComponent(selectedCity)}/pm25/24h`)
      const pm25 = await pmRes.json() // expected: [{ timestamp, value | pm25 }, ...]

      // Merge temperature and pm25 arrays into the historical format used by TimeSeriesCharts
      const historical = (temperatures || []).map((t: any, i: number) => ({
        timestamp: t.timestamp ?? pm25?.[i]?.timestamp,
        temperature: t.value ?? t.temperature,
        pm25: pm25?.[i]?.value ?? pm25?.[i]?.pm25,
      }))

      setAirQualityData({
        city: selectedCity,
        current,
        historical,
      })
    } catch (err) {
      console.error('Error fetching air quality data:', err)
    } finally {
      setLoading(false)
    }
    return
    */
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
          <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} cities={cities} />

          {airQualityData && (
            <>
              <HealthAlert data={airQualityData.current} />

              <AirQualityIndicators data={airQualityData.current} />

              <TimeSeriesCharts data={airQualityData.historical} />

              <CityComparison currentCity={selectedCity} currentPm25={airQualityData.current?.pm25} />

              <ReportGenerator city={selectedCity} data={airQualityData} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
