"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface CitySelectorProps {
  selectedCity: string
  onCityChange: (city: string) => void
  // Optional list of cities supplied from a backend or parent component
  cities?: string[]
}

const BRAZILIAN_CITIES = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Brasília",
  "Curitiba",
  "Porto Alegre",
  "Salvador",
  "Fortaleza",
]

export function CitySelector({ selectedCity, onCityChange }: CitySelectorProps) {
  // Use provided cities list when available (e.g., loaded from backend), otherwise fallback
  const list = (arguments[0] as any)?.cities ?? BRAZILIAN_CITIES
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
              {list.map((city: string) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}
