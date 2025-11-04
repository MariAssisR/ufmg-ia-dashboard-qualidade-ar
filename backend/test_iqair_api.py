"""
Script para testar diretamente a API IQAir e ver a estrutura real dos dados.
Execute: python test_iqair_api.py
"""

import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

IQAIR_API_KEY = os.getenv("IQAIR_API_KEY")
IQAIR_API_URL = "http://api.airvisual.com/v2/"

if not IQAIR_API_KEY:
    print("❌ IQAIR_API_KEY não encontrada no .env")
    exit(1)

print("🔍 Testando API IQAir...\n")

# Testa com São Paulo
city = "São Paulo"
state = "São Paulo"
country = "Brazil"

params = {
    "key": IQAIR_API_KEY,
    "city": city,
    "state": state,
    "country": country
}

print(f"📍 Consultando: {city}, {state}, {country}")
print(f"🔗 URL: {IQAIR_API_URL}city")
print(f"📦 Params: city={city}, state={state}, country={country}\n")

try:
    response = httpx.get(f"{IQAIR_API_URL}city", params=params, timeout=30.0)
    response.raise_for_status()
    data = response.json()
    
    print("✅ Resposta recebida!\n")
    print("=" * 80)
    print("📄 ESTRUTURA COMPLETA DA RESPOSTA:")
    print("=" * 80)
    print(json.dumps(data, indent=2, ensure_ascii=False))
    print("=" * 80)
    
    # Analisa a estrutura
    if data.get("status") == "success":
        print("\n✅ Status: success")
        
        current = data.get("data", {}).get("current", {})
        pollution = current.get("pollution", {})
        weather = current.get("weather", {})
        
        print("\n📊 DADOS EXTRAÍDOS:")
        print(f"  🌫️  Pollution data: {pollution}")
        print(f"  🌡️  Weather data: {weather}")
        
        print("\n🔑 CHAVES DISPONÍVEIS:")
        print(f"  • pollution keys: {list(pollution.keys())}")
        print(f"  • weather keys: {list(weather.keys())}")
        
        print("\n💡 VALORES:")
        print(f"  • AQI US (aqius): {pollution.get('aqius')}")
        print(f"  • AQI CN (aqicn): {pollution.get('aqicn')}")
        print(f"  • Temperatura: {weather.get('tp')}°C")
        print(f"  • Umidade: {weather.get('hu')}%")
        print(f"  • Timestamp: {weather.get('ts')}")
        
        print("\n📝 CONCLUSÃO:")
        print("  ➡️  O campo 'pm25' não existe diretamente na resposta!")
        print("  ➡️  Use 'aqius' (Air Quality Index US) como referência")
        print("  ➡️  'aqius' é um índice de 0-500, não µg/m³")
        
    else:
        print(f"\n❌ Status: {data.get('status')}")
        print(f"❌ Mensagem: {data.get('data', {}).get('message', 'Erro desconhecido')}")
        
except httpx.HTTPStatusError as e:
    print(f"❌ Erro HTTP: {e.response.status_code}")
    print(f"❌ Resposta: {e.response.text}")
    
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "=" * 80)
print("✅ Teste concluído!")
print("=" * 80)

