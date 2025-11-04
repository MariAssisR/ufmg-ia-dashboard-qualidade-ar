#!/bin/bash

if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

echo "🔄 Ativando ambiente..."
source venv/bin/activate

echo "📥 Instalando dependências..."
pip install -q -r requirements.txt

if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "Crie um arquivo .env com:"
    echo "IQAIR_API_KEY=sua_chave"
    echo "OPENWEATHER_API_KEY=sua_chave"
    exit 1
fi

echo "🚀 Iniciando servidor..."
python main.py

