"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"

interface ReportGeneratorProps {
  city: string
  data: any
}

export function ReportGenerator({ city, data }: ReportGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [report, setReport] = useState<string | null>(null)

  const generateReport = async () => {
    setGenerating(true)

    // Simulating report generation - replace with actual backend call
    setTimeout(() => {
      const pm25 = data.current.pm25
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
- Temperatura: ${data.current.temperature.toFixed(1)}°C
- Umidade: ${data.current.humidity.toFixed(0)}%

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
A concentração média de PM2.5 nas últimas 24 horas foi de ${(data.historical.reduce((acc: number, item: any) => acc + item.pm25, 0) / data.historical.length).toFixed(1)} µg/m³.

---
Relatório gerado automaticamente pelo Dashboard de Qualidade do Ar
      `.trim()

      setReport(reportText)
      setGenerating(false)
    }, 1500)
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

        {report && (
          <div className="rounded-lg bg-muted p-4">
            <pre className="whitespace-pre-wrap text-sm font-mono text-foreground leading-relaxed">{report}</pre>
          </div>
        )}
      </div>
    </Card>
  )
}
