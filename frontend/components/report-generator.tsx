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

export function ReportGenerator({ city }: ReportGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [report, setReport] = useState<string | null>(null)
  const [error, setError] = useState<string|null>(null)

  const generateReport = async () => {
    setGenerating(true)
    setError(null)
    try {
      const current = await getCurrentCityData(city, "", "Brazil")
      const historicalResp = await getCityHistory(city, 24)
      const historical = historicalResp.data || []
      const pm25 = current.pm25
      const quality =
        pm25 <= 12 ? "boa" : pm25 <= 35 ? "moderada" : pm25 <= 55 ? "insalubre para grupos sensíveis" : "insalubre"
      const reportText = `
RELATÓRIO DE QUALIDADE DO AR - ${city}
Data: ${new Date().toLocaleDateString("pt-BR")}
Hora: ${new Date().toLocaleTimeString("pt-BR")}

RESUMO EXECUTIVO
Hoje, ${city} apresentou níveis ${quality} de poluição do ar.

INDICADORES PRINCIPAIS
- PM2.5: ${pm25.toFixed(1)} µg/m³
- Temperatura: ${current.temperature.toFixed(1)}°C
- Umidade: ${current.humidity.toFixed(0)}%

CLASSIFICAÇÃO
A qualidade do ar foi classificada como "${quality}".

RECOMENDAÇÕES
${
  pm25 > 55
    ? "⚠️ Evite atividades ao ar livre. Mantenha janelas fechadas."
    : pm25 > 35
      ? "⚠️ Grupos sensíveis devem limitar atividades ao ar livre."
      : pm25 > 12
        ? "ℹ️ Qualidade do ar aceitável para a maioria das pessoas."
        : "✓ Qualidade do ar excelente. Aproveite atividades ao ar livre."
}

ANÁLISE DAS ÚLTIMAS 24 HORAS
A concentração média de PM2.5 nas últimas 24 horas foi de ${historical.length > 0 ? (historical.reduce((acc: number, item: any) => acc + Number(item.pm25), 0) / historical.length).toFixed(1) : "N/D"} µg/m³.

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
