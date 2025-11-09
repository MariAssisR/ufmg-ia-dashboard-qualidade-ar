# 🌍 Backend Python - Qualidade do Ar

Backend Python com FastAPI para coleta e armazenamento de dados de qualidade do ar usando IQAir e OpenWeather APIs.

## ✅ Status: 100% Funcional

- ✅ Coleta automática a cada 5 minutos
- ✅ Armazenamento em CSV
- ✅ Endpoints REST completos
- ✅ 19 testes unitários (100% passando)
- ✅ Debug tools integradas

---

## 🚀 Quick Start

### 1. Configuração (primeira vez)

```bash
cd back

# Copiar template de configuração
cp .env.example .env

# Editar com suas API keys
nano .env
```

**Obter API keys (gratuitas):**
- **IQAir**: https://www.iqair.com/air-pollution-data-api (10.000 chamadas/mês)
- **OpenWeather**: https://openweathermap.org/api (1.000 chamadas/dia)

### 2. Rodar servidor

```bash
./start.sh
```

O script automaticamente:
- ✅ Cria ambiente virtual (venv)
- ✅ Instala todas as dependências
- ✅ Verifica se o `.env` existe
- ✅ Inicia o servidor

**Saída esperada:**
```
🔄 [08:30:00] Iniciando coleta automática...
✅ São Paulo: AQI=45, Temp=23°C
✅ Rio de Janeiro: AQI=38, Temp=26°C
✅ Fortaleza: AQI=40, Temp=22°C
✅ Coleta concluída!

✅ Scheduler iniciado! Coletando a cada 5 minutos...
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Servidor disponível em:** `http://localhost:8000`

### 3. Opção Manual (sem script)

```bash
# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Rodar
python main.py
```

---

## 📡 Endpoints Disponíveis

### Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Info da API |
| `GET` | `/docs` | Documentação interativa (Swagger) |
| `GET` | `/health` | Status do servidor |

### Dados de Localização (IQAir)

```bash
# Listar países
GET /countries

# Listar estados
GET /states?country=Brazil

# Listar cidades
GET /cities?country=Brazil&state=Sao Paulo
```

### Dados Atuais

```bash
# Dados atuais de uma cidade (IQAir)
# IMPORTANTE: Também salva automaticamente no CSV
GET /cities/{city}/current?state={state}&country={country}

# Exemplo:
GET /cities/São Paulo/current?state=São Paulo&country=Brazil
```

**Resposta:**
```json
{
  "source_api": "iqair",
  "pm25": 45,
  "temperature": 23,
  "humidity": 65,
  "timestamp": "2025-11-04T12:00:00.000Z",
  "raw_data": { ... }
}
```

### Histórico Coletado (CSV)

```bash
# Histórico de uma cidade (últimas 24h por padrão)
GET /cities/{city}/history?hours=24

# Todo histórico (todas cidades)
GET /history/all?hours=48
```

**Resposta:**
```json
{
  "city": "São Paulo",
  "hours": 24,
  "total_records": 288,
  "data": [
    {
      "timestamp": "2025-11-04T12:00:00+00:00",
      "city": "São Paulo",
      "state": "São Paulo",
      "country": "Brazil",
      "pm25": "45",
      "temperature": "23",
      "humidity": "65",
      "aqi": "45"
    }
  ]
}
```

### Histórico OpenWeather (24h)

```bash
# PM2.5 das últimas 24h
GET /cities/{city}/pm25/24h?state={state}&country={country}

# Poluição completa das últimas 24h
GET /cities/{city}/pollution/24h?state={state}&country={country}
```

### Debug

```bash
# Ver resposta completa da API IQAir
GET /debug/raw/{city}?state={state}&country={country}

# Converter cidade em coordenadas
GET /geocode?city={city}&state={state}&country={country}
```

---

## 🔄 Coleta Automática

### Como Funciona

O backend coleta dados **automaticamente a cada 5 minutos** das cidades configuradas e salva em `dados_qualidade_ar.csv`.

**Cidades coletadas:**
- São Paulo, SP
- Rio de Janeiro, RJ
- Fortaleza, CE

### Adicionar Mais Cidades

Edite `CITIES_TO_COLLECT` em `main.py`:

```python
CITIES_TO_COLLECT = [
  {"city": "São Paulo", "state": "São Paulo", "country": "Brazil"},
  {"city": "Fortaleza", "state": "Ceará", "country": "Brazil"},
  {"city": "Porto Alegre", "state": "Rio Grande do Sul", "country": "Brazil"},
  # Adicione mais...
]
```

### Alterar Intervalo

Em `main.py`, linha ~162:

```python
scheduler.add_job(scheduled_collection, 'interval', minutes=5, id='collect_data')
#                                                     ^^^^^^^^
# Mude para: minutes=10, minutes=30, etc.
```

### Arquivo CSV

**Localização:** `back/dados_qualidade_ar.csv`

**Estrutura:**
```csv
timestamp,city,state,country,pm25,temperature,humidity,aqi
2025-11-04T12:00:00+00:00,São Paulo,São Paulo,Brazil,45,23,65,45
```

**Campos:**
- `timestamp`: Data/hora da coleta (UTC)
- `city`, `state`, `country`: Localização
- `pm25`: **AQI US** (0-500) - não é µg/m³!
- `temperature`: Temperatura em °C
- `humidity`: Umidade relativa (%)
- `aqi`: Índice AQI US

---

## 🧪 Testes Unitários

### Rodar Testes

```bash
# Rodar todos os testes
pytest mainTest.py -v

# Rodar teste específico
pytest mainTest.py -v -k "test_save_to_csv"

# Ver cobertura
pytest mainTest.py -v --cov=main
```

### Resultado Esperado

```
============================= test session starts ==============================
collected 19 items

mainTest.py::test_root_endpoint PASSED                                   [  5%]
mainTest.py::test_countries_endpoint PASSED                              [ 10%]
mainTest.py::test_states_endpoint PASSED                                 [ 15%]
mainTest.py::test_cities_endpoint PASSED                                 [ 21%]
mainTest.py::test_current_data_missing_params PASSED                     [ 26%]
mainTest.py::test_history_endpoint_city_not_found PASSED                 [ 31%]
mainTest.py::test_history_all_endpoint PASSED                            [ 36%]
mainTest.py::test_geocode_endpoint PASSED                                [ 42%]
mainTest.py::test_debug_endpoint PASSED                                  [ 47%]
mainTest.py::test_save_to_csv_creates_file PASSED                        [ 52%]
mainTest.py::test_save_to_csv_appends_data PASSED                        [ 57%]
mainTest.py::test_read_from_csv_empty_file PASSED                        [ 63%]
mainTest.py::test_read_from_csv_filters_by_city PASSED                   [ 68%]
mainTest.py::test_read_from_csv_filters_by_hours PASSED                  [ 73%]
mainTest.py::test_csv_headers_completeness PASSED                        [ 78%]
mainTest.py::test_response_model_structure PASSED                        [ 84%]
mainTest.py::test_integration_save_and_read_csv PASSED                   [ 89%]
mainTest.py::test_current_endpoint_with_valid_data PASSED                [ 94%]
mainTest.py::test_current_endpoint_saves_to_csv PASSED                   [100%]

======================== 19 passed, 4 warnings in 0.26s ========================
```

**✅ 19/19 testes passaram! 100% de sucesso!**

### O que é Testado

#### ✅ Endpoints da API (mockados)
- Endpoint raiz e docs
- Listagem de países, estados e cidades
- Dados atuais (`/current`)
- Histórico coletado (`/history`)
- Geocoding e debug

#### ✅ Funções CSV
- Criação de arquivo
- Append de dados
- Leitura com filtros (cidade, tempo)

#### ✅ Validação
- Headers do CSV
- Estrutura de respostas
- Validação de parâmetros

#### ✅ Integração
- Fluxo completo: salvar → ler → filtrar

### Boas Práticas Implementadas

1. **Mock de serviços externos** - Nenhuma chamada HTTP real
2. **Fixtures do pytest** - Reutilização de setup
3. **Testes isolados** - Cada teste é independente
4. **Limpeza automática** - Arquivos temporários removidos
5. **Rápido** - ~0.26 segundos para todos os testes

**Importante:** Todos os serviços externos são mockados! Os testes **não requerem API keys** e **não fazem chamadas HTTP reais**.

---

## 📊 Estrutura dos Dados

### Resposta da IQAir

A API IQAir retorna esta estrutura:

```json
{
  "status": "success",
  "data": {
    "current": {
      "pollution": {
        "ts": "2025-11-04T12:00:00.000Z",
        "aqius": 45,      // ← AQI US (usado como pm25)
        "mainus": "p2",
        "aqicn": 30,
        "maincn": "p2"
      },
      "weather": {
        "ts": "2025-11-04T12:00:00.000Z",
        "tp": 23,         // Temperatura
        "hu": 65,         // Umidade
        "pr": 1013,
        "ws": 3.5
      }
    }
  }
}
```

**⚠️ Importante:** A API IQAir **não retorna PM2.5 em µg/m³** diretamente. O campo `pm25` armazena o **AQI US** (0-500).

### Interpretação do AQI

| AQI | Qualidade | Cor | Descrição | Recomendação |
|-----|-----------|-----|-----------|--------------|
| 0-50 | Boa | 🟢 Verde | Ar limpo | Aproveite atividades ao ar livre |
| 51-100 | Moderada | 🟡 Amarelo | Aceitável | Pessoas sensíveis devem considerar limitar esforços prolongados |
| 101-150 | Insalubre (sensíveis) | 🟠 Laranja | Grupos sensíveis | Crianças e pessoas com problemas respiratórios devem limitar atividades |
| 151-200 | Insalubre | 🔴 Vermelho | Todos afetados | Todos devem evitar atividades prolongadas ao ar livre |
| 201-300 | Muito insalubre | 🟣 Roxo | Alerta de saúde | Evitar sair de casa |
| 301+ | Perigosa | 🟤 Marrom | Emergência | Ficar em casa com janelas fechadas |

### Converter AQI → µg/m³ (Opcional)

Se precisar da concentração real de PM2.5 em µg/m³:

**Opção 1:** Use o endpoint OpenWeather (já implementado)
```bash
GET /cities/{city}/pm25/24h
```

**Opção 2:** Fórmula de conversão EPA (simplificada)
```python
def aqi_to_pm25(aqi):
    # Faixa 0-50 AQI = 0-12 µg/m³
    if aqi <= 50:
        return aqi * 12 / 50
    # Adicione outras faixas conforme necessário
    # Ver: https://www.airnow.gov/aqi/aqi-calculator/
```

---

## 🔍 Troubleshooting

### Problema: Dependências não instaladas

```bash
pip install --user apscheduler pytest pytest-asyncio
```

Ou use o script:
```bash
./start.sh  # Instala automaticamente
```

### Problema: Valores nulos no CSV

**1. Use o endpoint de debug:**
```bash
curl "http://localhost:8000/debug/raw/São Paulo?state=São Paulo&country=Brazil"
```

**2. Rode o script de teste da API:**
```bash
python test_iqair_api.py
```

Este script mostra:
- ✅ Estrutura completa do JSON retornado
- ✅ Quais campos existem
- ✅ Valores atuais
- ✅ Explicação sobre AQI vs PM2.5

**3. Verifique suas API keys no `.env`:**
```bash
cat .env
# Deve conter:
# IQAIR_API_KEY=sua_chave_aqui
# OPENWEATHER_API_KEY=sua_chave_aqui
```

### Problema: "IQAIR_API_KEY não encontrada"

```bash
# Copie o exemplo
cp .env.example .env

# Edite e adicione suas chaves
nano .env
```

### Problema: Erro 401/403 nas APIs

- Verifique se suas chaves estão corretas
- Confirme que as chaves estão ativas
- IQAir free: 10.000 chamadas/mês
- OpenWeather free: 1.000 chamadas/dia

### Problema: Cidade não encontrada

Formato correto para a IQAir:
- ✅ `São Paulo` (pode usar acentos)
- ✅ `Rio de Janeiro` (com espaços)
- ❌ Evite caracteres especiais além de acentos

Use o endpoint para listar cidades disponíveis:
```bash
curl "http://localhost:8000/cities?country=Brazil&state=Sao%20Paulo"
```

### Problema: Testes falhando

**Todos os 19 testes devem passar!**

Se algum falhar:

1. Instale as dependências:
```bash
pip install --user -r requirements.txt
```

2. Rode novamente com verbose:
```bash
pytest mainTest.py -v
```

3. Veja os logs detalhados para identificar o problema

### Problema: Porta 8000 já em uso

Mude a porta em `main.py` (última linha):
```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # Era 8000
```

---

## 📦 Estrutura do Projeto

```
back/
├── main.py                     # Servidor FastAPI principal
├── mainTest.py                 # 19 testes unitários
├── test_iqair_api.py           # Script para debug da API IQAir
├── requirements.txt            # Dependências Python
├── start.sh                    # Script de inicialização
├── .env.example                # Template de configuração
├── .gitignore                  # Ignora venv, CSV, .env
├── README.md                   # Esta documentação
└── dados_qualidade_ar.csv      # Dados coletados (gerado automaticamente)
```

## 🔧 Dependências

| Pacote | Versão | Uso |
|--------|--------|-----|
| `fastapi` | Latest | Framework web |
| `uvicorn[standard]` | Latest | Servidor ASGI |
| `httpx` | Latest | Cliente HTTP assíncrono |
| `python-dotenv` | Latest | Gerenciar variáveis de ambiente |
| `apscheduler` | Latest | Scheduler para coleta automática |
| `pytest` | Latest | Framework de testes |
| `pytest-asyncio` | Latest | Suporte async para pytest |

---

## 📈 O que Acontece Automaticamente

1. **A cada 5 minutos**: Coleta dados das 3 cidades configuradas
2. **Toda consulta `/current`**: Salva os dados no CSV também
3. **Histórico acumula**: Dados crescem ao longo do tempo
4. **CSV persiste**: Arquivo não é deletado ao reiniciar
5. **Logs informativos**: Ver progresso no terminal

---

## 🎓 Melhorias Futuras (Opcional)

### 1. Adicionar Mais Cidades
Edite `CITIES_TO_COLLECT` em `main.py`

### 2. Banco de Dados Real
Substitua CSV por SQLite ou PostgreSQL:
```python
# Em vez de CSV
save_to_csv(data)

# Use SQLAlchemy
session.add(Measurement(**data))
session.commit()
```

### 3. Cache com Redis
```python
from redis import Redis
cache = Redis()

@app.get("/cities/{city}/current")
async def get_current(city: str):
    cached = cache.get(f"city:{city}")
    if cached:
        return json.loads(cached)
    # ... buscar da API
```

### 4. Rate Limiting
```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/cities/{city}/current")
@limiter.limit("10/minute")
async def get_current(...):
    ...
```

### 5. Notificações
```python
def send_alert(city, aqi):
    if aqi > 100:
        # Enviar email/SMS
        send_notification(f"⚠️ {city}: AQI {aqi}")
```

---

## 🆘 Suporte

**Documentação das APIs:**
- **IQAir**: https://www.iqair.com/air-pollution-data-api
- **OpenWeather**: https://openweathermap.org/api
- **FastAPI**: https://fastapi.tiangolo.com/

**Documentação Interativa:**
Quando o servidor estiver rodando: `http://localhost:8000/docs`

---

## ✅ Checklist de Validação

Use esta checklist para confirmar que tudo está funcionando:

- [ ] `.env` configurado com API keys válidas
- [ ] Script `./start.sh` executa sem erros
- [ ] Servidor inicia em `http://localhost:8000`
- [ ] Coleta automática mostra logs de sucesso
- [ ] Arquivo `dados_qualidade_ar.csv` é criado
- [ ] Endpoint `/` retorna info da API
- [ ] Endpoint `/health` retorna status OK
- [ ] Testes passam: `pytest mainTest.py -v` → 19/19 ✅
- [ ] Debug funciona: `curl http://localhost:8000/debug/raw/...`
- [ ] CSV contém dados após 5 minutos

---

## 🎉 Conclusão

**Backend 100% funcional e testado!**

- ✅ Coleta automática funcionando
- ✅ Armazenamento em CSV persistente
- ✅ Endpoints REST completos
- ✅ 19 testes unitários (100% passando)
- ✅ Debug tools integradas
- ✅ Documentação completa

**Pronto para usar em produção ou desenvolvimento!** 🚀

---

**Desenvolvido com FastAPI + Python 3.9+ 🐍**
