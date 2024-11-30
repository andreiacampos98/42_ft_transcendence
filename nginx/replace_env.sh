#!/bin/bash

# Caminho do arquivo de configuração do Nginx com variáveis a substituir
TEMPLATE_FILE="default.conf"
OUTPUT_FILE="default.conf"

# Verifica se as variáveis de ambiente necessárias estão definidas
if [[ -z "$CERTIFY_PATH" ]]; then
    echo "Erro: CERTIFY_PATH não está definido."
    exit 1
fi

# Substitui as variáveis de ambiente no arquivo template
envsubst '$CERTIFY_PATH' < "$TEMPLATE_FILE" > "$OUTPUT_FILE"

# Exibe o arquivo final para verificação (opcional)
echo "Arquivo final gerado: $OUTPUT_FILE"
cat "$OUTPUT_FILE"

nginx -g "daemon off;"
