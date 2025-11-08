"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { getAllHistory } from "../lib/api"

interface CitySelectorProps {
  selectedCity: string
  onCityChange: (city: string) => void
}

export function CitySelector({ selectedCity, onCityChange }: CitySelectorProps) {
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    setLoading(true)
    getAllHistory(48).then(res => {
      const rawArr = (res.data as any[] || [])
      const unique = Array.from(new Set(rawArr.map((i:any) => String(i.city)))).sort()
      setCities(unique)
      setLoading(false)
    }).catch((err) => {
      setError('Erro ao carregar cidades disponíveis: '+err)
      setLoading(false)
    })
  }, [])

  if(loading) return <Card className="p-6">Carregando cidades...</Card>
  if(error) return <Card className="p-6 text-red-600">{error}</Card>

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground mb-2 block">Selecione a cidade</label>
          <Select value={selectedCity} onValueChange={onCityChange}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Escolha uma cidade" />
            </SelectTrigger>
            <SelectContent>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}
