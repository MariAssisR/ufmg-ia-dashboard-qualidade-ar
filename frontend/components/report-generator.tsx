"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"
import { getCurrentCityData, getCityHistory } from "../lib/api"

interface ReportGeneratorProps {
  city: string
  data: any
}

export function ReportGenerator({ city, data }: ReportGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [report, setReport] = useState<string | null>(null)
  const [error, setError] = useState<string|null>(null)

  const generateReport = async () => {
    setGenerating(true)
    setError(null)
    try {
      const current = data?.current || {}
      const historical = data?.historical || []

      const formatNumber = (value: any, digits = 1) => {
        const num = Number(value)
        return isFinite(num) ? num.toFixed(digits) : "N/D"
      }

      const pm25 = current.pm25
      const temperature = current.temperature
      const humidity = current.humidity

      const quality =
        typeof pm25 === "number" && isFinite(pm25)
          ? pm25 <= 12
            ? "boa"
            : pm25 <= 35
            ? "moderada"
            : pm25 <= 55
            ? "insalubre para grupos sensíveis"
            : "insalubre"
          : "desconhecida"

      // Média PM2.5 das últimas 24h
      let pm25Media = "N/D"
      if (historical.length > 0) {
        const validPm25 = historical.map((item: any) => Number(item.pm25)).filter((v: number) => isFinite(v))
        if (validPm25.length > 0) {
          pm25Media = (validPm25.reduce((acc: number, v: number) => acc + v, 0) / validPm25.length).toFixed(1)
        }
      }

      let recomendacao = "Dados insuficientes para recomendação."
      if (typeof pm25 === "number" && isFinite(pm25)) {
        if (pm25 > 55) {
          recomendacao = "⚠️ Evite atividades ao ar livre. Mantenha janelas fechadas."
        } else if (pm25 > 35) {
          recomendacao = "⚠️ Grupos sensíveis devem limitar atividades ao ar livre."
        } else if (pm25 > 12) {
          recomendacao = "ℹ️ Qualidade do ar aceitável para a maioria das pessoas."
        } else {
          recomendacao = "✓ Qualidade do ar excelente. Aproveite atividades ao ar livre."
        }
      }

      const reportText = `
RELATÓRIO DE QUALIDADE DO AR - ${city}
Data: ${new Date().toLocaleDateString("pt-BR")}
Hora: ${new Date().toLocaleTimeString("pt-BR")}

RESUMO EXECUTIVO
Hoje, ${city} apresentou níveis ${quality} de poluição do ar.

INDICADORES PRINCIPAIS
- PM2.5: ${formatNumber(pm25, 1)} µg/m³
- Temperatura: ${formatNumber(temperature, 1)}°C
- Umidade: ${formatNumber(humidity, 0)}%

CLASSIFICAÇÃO
A qualidade do ar foi classificada como "${quality}".

RECOMENDAÇÕES
${recomendacao}

ANÁLISE DAS ÚLTIMAS 24 HORAS
A concentração média de PM2.5 nas últimas 24 horas foi de ${pm25Media} µg/m³.

---
Relatório gerado automaticamente pelo Dashboard de Qualidade do Ar
      `.trim()
      setReport(reportText)
    } catch(err:any) {
      setError('Erro ao gerar relatório: '+(err?.message || err))
    } finally {
      setGenerating(false)
    }
  }

  const downloadReport = () => {
    if (!report) return

    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-qualidade-ar-${city}-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Relatório Automático</h3>
            <p className="text-sm text-muted-foreground">Gere um resumo detalhado da qualidade do ar</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateReport} disabled={generating} variant="default">
              <FileText className="h-4 w-4 mr-2" />
              {generating ? "Gerando..." : "Gerar Relatório"}
            </Button>
            {report && (
              <Button onClick={downloadReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            <p className="font-medium">Erro: {error}</p>
          </div>
        )}

        {report && (
          <div className="rounded-lg bg-muted p-4">
            <pre className="whitespace-pre-wrap text-sm font-mono text-foreground leading-relaxed">{report}</pre>
          </div>
        )}
      </div>
    </Card>
  )
}
