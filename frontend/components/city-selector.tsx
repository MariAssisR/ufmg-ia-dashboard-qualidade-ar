"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface CitySelectorProps {
  selectedCity: string
  onCityChange: (city: string) => void
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
              {BRAZILIAN_CITIES.map((city) => (
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
