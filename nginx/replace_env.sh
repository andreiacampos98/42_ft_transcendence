#!/bin/sh

# Criar o diretório para os certificados
mkdir -p /etc/nginx/certs/cert/ && \
openssl req -x509 -nodes -out ${CERTIFY_PATH}.crt -keyout ${CERTIFY_PATH}.key \
-subj "/C=PT/ST=OPO/L=Porto/O=42/OU=42/CN=${DOMAIN}/UID=${DOMAIN_NAME}"

echo "Certificado criado com sucesso!"

# Substituir variáveis de ambiente no arquivo de configuração
envsubst '$CERTIFY_PATH $DOMAIN $DOMAIN_NAME' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

echo "Variáveis substituídas com sucesso!"
