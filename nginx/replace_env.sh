#!/bin/sh

# Substituir variáveis de ambiente no arquivo de configuração
envsubst '$CERTIFY_PATH $DOMAIN $DOMAIN_NAME' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

echo "Variáveis substituídas com sucesso!"

