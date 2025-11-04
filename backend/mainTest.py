"""
Testes unitários para o backend de qualidade do ar
Execute com: pytest mainTest.py -v

IMPORTANTE: Todos os serviços externos são mockados (não fazem chamadas reais)
"""

import pytest
import csv
import os
from pathlib import Path
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
import httpx
from main import app, save_to_csv, read_from_csv, CSV_FILE, CSV_HEADERS

# Cliente de testes do FastAPI
client = TestClient(app)


# --- Testes de Endpoints ---

def test_root_endpoint():
    """Testa se o endpoint raiz retorna informações da API"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert data["version"] == "2.0"


def test_countries_endpoint():
    """Testa se o endpoint de países funciona (com mock)"""
    # Mock da resposta da API IQAir
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "status": "success",
        "data": [
            {"country": "Brazil"},
            {"country": "USA"}
        ]
    }
    
    # Mock do http_client
    mock_client = AsyncMock()
    mock_client.get.return_value = mock_response
    app.state.http_client = mock_client
    
    response = client.get("/countries")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["country"] == "Brazil"


def test_states_endpoint():
    """Testa se o endpoint de estados funciona (com mock)"""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "status": "success",
        "data": [
            {"state": "Sao Paulo"},
            {"state": "Rio de Janeiro"}
        ]
    }
    
    mock_client = AsyncMock()
    mock_client.get.return_value = mock_response
    app.state.http_client = mock_client
    
    response = client.get("/states?country=Brazil")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_cities_endpoint():
    """Testa se o endpoint de cidades funciona (com mock)"""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "status": "success",
        "data": [
            {"city": "Sao Paulo"},
            {"city": "Campinas"}
        ]
    }
    
    mock_client = AsyncMock()
    mock_client.get.return_value = mock_response
    app.state.http_client = mock_client
    
    response = client.get("/cities?country=Brazil&state=Sao Paulo")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_current_data_missing_params():
    """Testa se retorna erro quando faltam parâmetros obrigatórios"""
    # Mock do client (mesmo que não seja usado, precisa estar disponível)
    mock_client = AsyncMock()
    app.state.http_client = mock_client
    
    response = client.get("/cities/Sao Paulo/current")
    assert response.status_code == 422  # Unprocessable Entity (faltam params)


def test_history_endpoint_city_not_found():
    """Testa se retorna 404 quando cidade não tem dados no histórico"""
    response = client.get("/cities/CidadeInexistente123/history?hours=24")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data


def test_history_all_endpoint():
    """Testa se o endpoint de histórico geral funciona"""
    response = client.get("/history/all?hours=24")
    assert response.status_code == 200
    data = response.json()
    assert "hours" in data
    assert "total_records" in data
    assert "cities" in data
    assert "data" in data


def test_geocode_endpoint():
    """Testa se o geocoding funciona (com mock)"""
    # Mock da resposta do OpenWeather Geocoding API
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = [
        {
            "name": "São Paulo",
            "lat": -23.5505,
            "lon": -46.6333,
            "country": "BR"
        }
    ]
    
    mock_client = AsyncMock()
    mock_client.get.return_value = mock_response
    app.state.http_client = mock_client
    
    response = client.get("/geocode?city=São Paulo&state=São Paulo&country=Brazil")
    assert response.status_code == 200
    data = response.json()
    assert data["lat"] == -23.5505
    assert data["lon"] == -46.6333


def test_debug_endpoint():
    """Testa se o endpoint de debug funciona (com mock)"""
    # Mock da resposta completa da IQAir
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "status": "success",
        "data": {
            "city": "Sao Paulo",
            "state": "Sao Paulo",
            "country": "Brazil",
            "current": {
                "weather": {
                    "ts": "2025-11-04T12:00:00.000Z",
                    "tp": 23,
                    "hu": 65
                },
                "pollution": {
                    "ts": "2025-11-04T12:00:00.000Z",
                    "aqius": 45,
                    "mainus": "p2"
                }
            }
        }
    }
    
    mock_client = AsyncMock()
    mock_client.get.return_value = mock_response
    app.state.http_client = mock_client
    
    response = client.get("/debug/raw/Sao Paulo?state=Sao Paulo&country=Brazil")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data


# --- Testes de Funções CSV ---

@pytest.fixture
def temp_csv_file(monkeypatch):
    """Cria um arquivo CSV temporário para testes"""
    test_csv = Path("test_dados_qualidade_ar.csv")
    monkeypatch.setattr("main.CSV_FILE", test_csv)
    
    yield test_csv
    
    # Cleanup: remove o arquivo após o teste
    if test_csv.exists():
        test_csv.unlink()


def test_save_to_csv_creates_file(temp_csv_file, monkeypatch):
    """Testa se save_to_csv cria o arquivo corretamente"""
    monkeypatch.setattr("main.CSV_FILE", temp_csv_file)
    
    test_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "city": "São Paulo",
        "state": "São Paulo",
        "country": "Brazil",
        "pm25": "25.5",
        "temperature": "22.0",
        "humidity": "65",
        "aqi": "45"
    }
    
    save_to_csv(test_data)
    
    assert temp_csv_file.exists()
    
    # Verifica se o header foi criado
    with open(temp_csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        assert headers == CSV_HEADERS


def test_save_to_csv_appends_data(temp_csv_file, monkeypatch):
    """Testa se save_to_csv adiciona dados sem sobrescrever"""
    monkeypatch.setattr("main.CSV_FILE", temp_csv_file)
    
    data1 = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "city": "São Paulo",
        "state": "São Paulo",
        "country": "Brazil",
        "pm25": "25.5",
        "temperature": "22.0",
        "humidity": "65",
        "aqi": "45"
    }
    
    data2 = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "city": "Rio de Janeiro",
        "state": "Rio de Janeiro",
        "country": "Brazil",
        "pm25": "18.3",
        "temperature": "26.5",
        "humidity": "70",
        "aqi": "38"
    }
    
    save_to_csv(data1)
    save_to_csv(data2)
    
    with open(temp_csv_file, 'r', encoding='utf-8') as f:
        reader = list(csv.DictReader(f))
        assert len(reader) == 2
        assert reader[0]["city"] == "São Paulo"
        assert reader[1]["city"] == "Rio de Janeiro"


def test_read_from_csv_empty_file(temp_csv_file, monkeypatch):
    """Testa se read_from_csv retorna lista vazia quando arquivo não existe"""
    monkeypatch.setattr("main.CSV_FILE", Path("arquivo_inexistente.csv"))
    
    result = read_from_csv()
    assert result == []


def test_read_from_csv_filters_by_city(temp_csv_file, monkeypatch):
    """Testa se read_from_csv filtra por cidade corretamente"""
    monkeypatch.setattr("main.CSV_FILE", temp_csv_file)
    
    # Adiciona dados de diferentes cidades
    now = datetime.now(timezone.utc)
    
    data_sp = {
        "timestamp": now.isoformat(),
        "city": "São Paulo",
        "state": "São Paulo",
        "country": "Brazil",
        "pm25": "25.5",
        "temperature": "22.0",
        "humidity": "65",
        "aqi": "45"
    }
    
    data_rj = {
        "timestamp": now.isoformat(),
        "city": "Rio de Janeiro",
        "state": "Rio de Janeiro",
        "country": "Brazil",
        "pm25": "18.3",
        "temperature": "26.5",
        "humidity": "70",
        "aqi": "38"
    }
    
    save_to_csv(data_sp)
    save_to_csv(data_rj)
    
    # Filtra só São Paulo
    result = read_from_csv(city="São Paulo")
    assert len(result) == 1
    assert result[0]["city"] == "São Paulo"


def test_read_from_csv_filters_by_hours(temp_csv_file, monkeypatch):
    """Testa se read_from_csv filtra por período de tempo"""
    monkeypatch.setattr("main.CSV_FILE", temp_csv_file)
    
    now = datetime.now(timezone.utc)
    old_time = now - timedelta(hours=48)
    
    # Dado antigo (48h atrás)
    old_data = {
        "timestamp": old_time.isoformat(),
        "city": "São Paulo",
        "state": "São Paulo",
        "country": "Brazil",
        "pm25": "25.5",
        "temperature": "22.0",
        "humidity": "65",
        "aqi": "45"
    }
    
    # Dado recente
    new_data = {
        "timestamp": now.isoformat(),
        "city": "São Paulo",
        "state": "São Paulo",
        "country": "Brazil",
        "pm25": "30.0",
        "temperature": "23.0",
        "humidity": "60",
        "aqi": "50"
    }
    
    save_to_csv(old_data)
    save_to_csv(new_data)
    
    # Busca últimas 24h (deve retornar só o novo)
    result = read_from_csv(hours=24)
    assert len(result) == 1
    assert result[0]["pm25"] == "30.0"


# --- Testes de Validação de Dados ---

def test_csv_headers_completeness():
    """Testa se todos os headers necessários estão definidos"""
    expected_headers = ["timestamp", "city", "state", "country", "pm25", "temperature", "humidity", "aqi"]
    assert CSV_HEADERS == expected_headers


def test_response_model_structure():
    """Testa se a resposta do endpoint raiz tem a estrutura esperada"""
    response = client.get("/")
    data = response.json()
    
    assert "message" in data
    assert "version" in data
    assert "features" in data
    assert "docs" in data
    assert "endpoints" in data


# --- Teste de Integração Simples ---

def test_integration_save_and_read_csv(temp_csv_file, monkeypatch):
    """Teste de integração: salva dados e depois lê"""
    monkeypatch.setattr("main.CSV_FILE", temp_csv_file)
    
    test_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "city": "Curitiba",
        "state": "Parana",
        "country": "Brazil",
        "pm25": "20.0",
        "temperature": "24.0",
        "humidity": "55",
        "aqi": "40"
    }
    
    # Salva
    save_to_csv(test_data)
    
    # Lê
    result = read_from_csv(city="Curitiba")
    
    assert len(result) == 1
    assert result[0]["city"] == "Curitiba"
    assert result[0]["pm25"] == "20.0"
    assert result[0]["aqi"] == "40"


def test_current_endpoint_with_valid_data():
    """Testa endpoint /current com dados válidos (mockado)"""
    # Mock da resposta da IQAir
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "status": "success",
        "data": {
            "current": {
                "weather": {
                    "ts": "2025-11-04T12:00:00.000Z",
                    "tp": 23,
                    "hu": 65,
                    "pr": 1013,
                    "ws": 3.5
                },
                "pollution": {
                    "ts": "2025-11-04T12:00:00.000Z",
                    "aqius": 45,
                    "mainus": "p2",
                    "aqicn": 30,
                    "maincn": "p2"
                }
            }
        }
    }
    
    mock_client = AsyncMock()
    mock_client.get.return_value = mock_response
    app.state.http_client = mock_client
    
    response = client.get("/cities/Sao Paulo/current?state=Sao Paulo&country=Brazil")
    assert response.status_code == 200
    data = response.json()
    assert data["pm25"] == 45  # AQI US
    assert data["temperature"] == 23
    assert data["humidity"] == 65


def test_current_endpoint_saves_to_csv(temp_csv_file, monkeypatch):
    """Testa se o endpoint /current salva dados no CSV (mockado)"""
    monkeypatch.setattr("main.CSV_FILE", temp_csv_file)
    
    # Mock da resposta da IQAir
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "status": "success",
        "data": {
            "current": {
                "weather": {
                    "ts": "2025-11-04T12:00:00.000Z",
                    "tp": 25,
                    "hu": 70
                },
                "pollution": {
                    "ts": "2025-11-04T12:00:00.000Z",
                    "aqius": 50,
                    "mainus": "p2"
                }
            }
        }
    }
    
    mock_client = AsyncMock()
    mock_client.get.return_value = mock_response
    app.state.http_client = mock_client
    
    # Faz requisição
    response = client.get("/cities/TestCity/current?state=TestState&country=Brazil")
    assert response.status_code == 200
    
    # Verifica se salvou no CSV
    assert temp_csv_file.exists()
    with open(temp_csv_file, 'r', encoding='utf-8') as f:
        reader = list(csv.DictReader(f))
        assert len(reader) > 0
        assert reader[-1]["city"] == "TestCity"
        assert reader[-1]["pm25"] == "50"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
