import os
import httpx
import asyncio
from fastapi import FastAPI, Request, HTTPException, Query
from pydantic import BaseModel, Field
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from typing import List, Optional, Any, Dict

# Carrega as variáveis de ambiente
load_dotenv()

# --- Configuração das APIs ---
IQAIR_API_KEY = os.getenv("IQAIR_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")  # Nova API!

if not IQAIR_API_KEY or not OPENWEATHER_API_KEY:
  raise EnvironmentError("IQAIR_API_KEY e/ou OPENWEATHER_API_KEY não foram encontradas no arquivo .env")

IQAIR_API_URL = "http://api.airvisual.com/v2/"
OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/"

IQAIR_PARAMS = {"key": IQAIR_API_KEY}

# --- Modelos de Resposta (Pydantic) ---

class CurrentDataResponse(BaseModel):
  source_api: str = "iqair"
  pm25: Optional[float] = None
  temperature: Optional[float] = None
  humidity: Optional[float] = None
  timestamp: Optional[str] = None
  raw_data: Dict[str, Any] = Field(default_factory=dict)

class TimeSeriesDataPoint(BaseModel):
  timestamp: str
  value: Optional[float] = None

class PM25Response(TimeSeriesDataPoint):
  pm25: Optional[float] = None
  aqi: Optional[int] = None  # Air Quality Index

class CountryResponse(BaseModel):
  country: str

class StateResponse(BaseModel):
  state: str

class CityResponse(BaseModel):
  city: str

# --- Inicialização do FastAPI ---
app = FastAPI(
  title="API Híbrida de Qualidade do Ar",
  description="IQAir para dados atuais + OpenWeatherMap para histórico 24h",
  version="2.0"
)

# --- Gerenciamento do Cliente HTTP ---
@app.on_event("startup")
async def startup_event():
  timeout = httpx.Timeout(30.0, connect=5.0)
  app.state.http_client = httpx.AsyncClient(timeout=timeout)

@app.on_event("shutdown")
async def shutdown_event():
  await app.state.http_client.aclose()

# --- Funções Auxiliares ---

async def get_coordinates_from_city(client: httpx.AsyncClient, city: str, state: Optional[str] = None, country: Optional[str] = None) -> Optional[Dict[str, float]]:
  """
  Converte nome de cidade em coordenadas usando a API de Geocoding do OpenWeatherMap.
  """
  try:
    # Monta a query de busca
    query = city
    if state:
      query += f",{state}"
    if country:
      query += f",{country}"

    response = await client.get(
      "https://api.openweathermap.org/geo/1.0/direct",
      params={
        "q": query,
        "limit": 1,
        "appid": OPENWEATHER_API_KEY
      }
    )
    response.raise_for_status()
    data = response.json()

    if data and len(data) > 0:
      return {
        "lat": data[0]["lat"],
        "lon": data[0]["lon"],
        "name": data[0].get("name", city),
        "country": data[0].get("country", "")
      }
    return None
  except Exception as e:
    print(f"Erro ao buscar coordenadas: {e}")
    return None

def get_24h_time_range() -> tuple[int, int]:
  """Retorna o intervalo de tempo das últimas 24h em Unix timestamp"""
  now_utc = datetime.now(timezone.utc)
  past_24h = now_utc - timedelta(hours=24)
  return int(past_24h.timestamp()), int(now_utc.timestamp())

async def get_24h_pollution_data(client: httpx.AsyncClient, lat: float, lon: float) -> List[Dict[str, Any]]:
  """
  Busca dados históricos de poluição das últimas 24h usando OpenWeatherMap.
  """
  start, end = get_24h_time_range()

  try:
    response = await client.get(
      f"{OPENWEATHER_API_URL}air_pollution/history",
      params={
        "lat": lat,
        "lon": lon,
        "start": start,
        "end": end,
        "appid": OPENWEATHER_API_KEY
      }
    )
    response.raise_for_status()
    data = response.json()

    formatted_results = []
    for item in data.get("list", []):
      dt = item.get("dt")
      timestamp = datetime.fromtimestamp(dt, tz=timezone.utc).isoformat()
      components = item.get("components", {})
      aqi = item.get("main", {}).get("aqi")

      formatted_results.append({
        "timestamp": timestamp,
        "pm25": components.get("pm2_5"),
        "pm10": components.get("pm10"),
        "aqi": aqi,
        "co": components.get("co"),
        "no2": components.get("no2"),
        "o3": components.get("o3"),
        "so2": components.get("so2")
      })

    return formatted_results
  except httpx.HTTPStatusError as e:
    raise HTTPException(
      status_code=e.response.status_code,
      detail=f"Erro da API OpenWeatherMap: {e.response.text}"
    )
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Erro ao processar dados: {str(e)}")

# --- Endpoints da API ---

@app.get("/", summary="Informações da API")
async def root():
  return {
    "message": "API Híbrida de Qualidade do Ar",
    "version": "2.0",
    "features": {
      "iqair": "Dados atuais (PM2.5, temperatura, umidade)",
      "openweathermap": "Dados históricos 24h (PM2.5, PM10, AQI, poluentes)"
    },
    "docs": "/docs",
    "endpoints": {
      "current": "/cities/{city}/current",
      "history": "/cities/{city}/pm25/24h"
    }
  }

# --- Parte 1: Endpoints Auxiliares (IQAir) ---

@app.get("/countries", response_model=List[CountryResponse], summary="Lista países disponíveis (IQAir)")
async def get_countries(request: Request):
  """Lista todos os países disponíveis na API da IQAir."""
  client = request.app.state.http_client
  try:
    response = await client.get(f"{IQAIR_API_URL}countries", params=IQAIR_PARAMS)
    response.raise_for_status()
    data = response.json()
    if data.get("status") != "success":
      raise HTTPException(status_code=400, detail=data.get("data", {}).get("message"))
    return data.get("data", [])
  except httpx.HTTPStatusError as e:
    raise HTTPException(status_code=e.response.status_code, detail=f"Erro da API IQAir: {e.response.text}")

@app.get("/states", response_model=List[StateResponse], summary="Lista estados de um país (IQAir)")
async def get_states(
    country: str = Query(..., description="Nome do país (ex: 'Brazil')"),
    request: Request = None
):
  """Lista todos os estados de um país específico."""
  client = request.app.state.http_client
  params = {**IQAIR_PARAMS, "country": country}
  try:
    response = await client.get(f"{IQAIR_API_URL}states", params=params)
    response.raise_for_status()
    data = response.json()
    if data.get("status") != "success":
      raise HTTPException(status_code=400, detail=data.get("data", {}).get("message"))
    return data.get("data", [])
  except httpx.HTTPStatusError as e:
    raise HTTPException(status_code=e.response.status_code, detail=f"Erro da API IQAir: {e.response.text}")

@app.get("/cities", response_model=List[CityResponse], summary="Lista cidades de um estado (IQAir)")
async def get_cities(
    state: str = Query(..., description="Nome do estado (ex: 'Sao Paulo')"),
    country: str = Query(..., description="Nome do país (ex: 'Brazil')"),
    request: Request = None
):
  """Lista todas as cidades de um estado e país específicos."""
  client = request.app.state.http_client
  params = {**IQAIR_PARAMS, "state": state, "country": country}
  try:
    response = await client.get(f"{IQAIR_API_URL}cities", params=params)
    response.raise_for_status()
    data = response.json()
    if data.get("status") != "success":
      raise HTTPException(status_code=400, detail=data.get("data", {}).get("message"))
    return data.get("data", [])
  except httpx.HTTPStatusError as e:
    raise HTTPException(status_code=e.response.status_code, detail=f"Erro da API IQAir: {e.response.text}")

# --- Parte 2: Endpoints de Dados ---

@app.get("/cities/{city}/current", response_model=CurrentDataResponse, summary="Dados atuais de uma cidade (IQAir)")
async def get_current_data(
    city: str,
    state: str = Query(..., description="Nome do estado (ex: 'Sao Paulo')"),
    country: str = Query(..., description="Nome do país (ex: 'Brazil')"),
    request: Request = None
):
  """
  Busca dados atuais de PM2.5, Temperatura e Umidade via IQAir.
  """
  client = request.app.state.http_client
  params = {**IQAIR_PARAMS, "city": city, "state": state, "country": country}

  try:
    response = await client.get(f"{IQAIR_API_URL}city", params=params)
    response.raise_for_status()
    data = response.json()

    if data.get("status") != "success":
      raise HTTPException(
        status_code=404,
        detail=data.get("data", {}).get("message", "Cidade não encontrada na IQAir")
      )

    current_data = data.get("data", {}).get("current", {})
    weather = current_data.get("weather", {})
    pollution = current_data.get("pollution", {})
    pm25_data = pollution.get("p2", {}).get("conc")

    return CurrentDataResponse(
      pm25=pm25_data,
      temperature=weather.get("tp"),
      humidity=weather.get("hu"),
      timestamp=weather.get("ts"),
      raw_data=data
    )
  except httpx.HTTPStatusError as e:
    raise HTTPException(status_code=e.response.status_code, detail=f"Erro da API IQAir: {e.response.text}")
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@app.get("/cities/{city}/pm25/24h", response_model=List[PM25Response], summary="Histórico de PM2.5 das últimas 24h (OpenWeatherMap)")
async def get_pm25_24h(
    city: str,
    request: Request,
    state: Optional[str] = Query(None, description="Nome do estado (opcional, ajuda na busca)"),
    country: Optional[str] = Query(None, description="Nome do país (opcional, ajuda na busca)")
):
  """
  Retorna série temporal de PM2.5 e AQI das últimas 24h via OpenWeatherMap.
  Inclui também PM10, CO, NO2, O3, SO2.
  """
  client = request.app.state.http_client

  # 1. Converter cidade em coordenadas
  coords = await get_coordinates_from_city(client, city, state, country)
  if not coords:
    raise HTTPException(
      status_code=404,
      detail=f"Cidade '{city}' não encontrada. Tente adicionar estado e país."
    )

  # 2. Buscar dados de poluição
  pollution_data = await get_24h_pollution_data(client, coords["lat"], coords["lon"])

  return [
    PM25Response(
      timestamp=item["timestamp"],
      value=item["pm25"],
      pm25=item["pm25"],
      aqi=item["aqi"]
    )
    for item in pollution_data
  ]

@app.get("/cities/{city}/pollution/24h", summary="Histórico completo de poluição 24h (OpenWeatherMap)")
async def get_pollution_24h(
    city: str,
    request: Request,
    state: Optional[str] = Query(None, description="Nome do estado"),
    country: Optional[str] = Query(None, description="Nome do país")
):
  """
  Retorna todos os dados de poluição das últimas 24h:
  PM2.5, PM10, AQI, CO, NO2, O3, SO2
  """
  client = request.app.state.http_client

  # Converter cidade em coordenadas
  coords = await get_coordinates_from_city(client, city, state, country)
  if not coords:
    raise HTTPException(
      status_code=404,
      detail=f"Cidade '{city}' não encontrada. Tente adicionar estado e país."
    )

  # Buscar dados de poluição
  pollution_data = await get_24h_pollution_data(client, coords["lat"], coords["lon"])

  return {
    "city": coords["name"],
    "country": coords["country"],
    "coordinates": {"lat": coords["lat"], "lon": coords["lon"]},
    "data": pollution_data
  }

@app.get("/geocode", summary="Converte cidade em coordenadas")
async def geocode_city(
    city: str = Query(..., description="Nome da cidade"),
    state: Optional[str] = Query(None, description="Nome do estado"),
    country: Optional[str] = Query(None, description="Nome do país"),
    request: Request = None
):
  """
  Endpoint auxiliar para descobrir as coordenadas de uma cidade.
  Útil para debug.
  """
  client = request.app.state.http_client
  coords = await get_coordinates_from_city(client, city, state, country)

  if not coords:
    raise HTTPException(
      status_code=404,
      detail=f"Cidade '{city}' não encontrada"
    )

  return coords

if __name__ == "__main__":
  import uvicorn
  uvicorn.run(app, host="0.0.0.0", port=8000)