const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Busca info básica da API
export async function getApiInfo() {
  const res = await fetch(`${API_BASE_URL}/`);
  return res.json();
}

// Lista de países
export async function getCountries() {
  const res = await fetch(`${API_BASE_URL}/countries`);
  return res.json();
}

export async function getStates(country: string) {
  const res = await fetch(`${API_BASE_URL}/states?country=${encodeURIComponent(country)}`);
  return res.json();
}

export async function getCities(country: string, state: string) {
  const res = await fetch(`${API_BASE_URL}/cities?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`);
  return res.json();
}

// Dados atuais de uma cidade
export async function getCurrentCityData(city: string, state: string, country: string) {
  const res = await fetch(`${API_BASE_URL}/cities/${encodeURIComponent(city)}/current?state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}`);
  return res.json();
}

// Histórico de uma cidade (por horas)
export async function getCityHistory(city: string, hours = 24) {
  const res = await fetch(`${API_BASE_URL}/cities/${encodeURIComponent(city)}/history?hours=${hours}`);
  return res.json();
}

// Histórico geral (todas as cidades)
export async function getAllHistory(hours = 48) {
  const res = await fetch(`${API_BASE_URL}/history/all?hours=${hours}`);
  return res.json();
}

// PM2.5 24h de uma cidade
export async function getCityPM25_24h(city: string, state: string, country: string) {
  const res = await fetch(`${API_BASE_URL}/cities/${encodeURIComponent(city)}/pm25/24h?state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}`);
  return res.json();
}

// Poluição completa 24h
// Poluição completa 24h (VERSÃO CORRIGIDA)
export async function getCityPollution24h(city: string, state: string, country: string) {
  
  // 1. VOLTAMOS para a URL original que você provou que funciona
  const res = await fetch(`${API_BASE_URL}/cities/${encodeURIComponent(city)}/pollution/24h?state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}`);

  // 2. Mantemos a verificação de erro (isso é bom)
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const errorMessage = errorData?.detail || `Erro na API: ${res.status} ${res.statusText}`;
    throw new Error(errorMessage);
  }

  // 3. Retorna o OBJETO JSON inteiro (ex: { city: "...", data: [...] })
  return res.json();
}
