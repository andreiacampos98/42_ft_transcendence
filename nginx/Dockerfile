FROM nginx:1.19.0-alpine

# Instalar OpenSSL
RUN apk add --no-cache openssl

# Copiar o script de substituição de variáveis
COPY replace_env.sh /bin/replace_env.sh
RUN chmod +x /bin/replace_env.sh

# Copiar o arquivo de configuração do Nginx
COPY ./default.conf /etc/nginx/conf.d/default.conf

# Gerar o certificado autoassinado e a chave
# ARG CERTIFY_PATH=/etc/nginx/certs/cert/anaraujo.42.fr
# ARG DOMAIN=anaraujo.42.fr
# ARG DOMAIN_NAME=anaraujo

RUN mkdir -p /etc/nginx/certs/cert/ && \
    openssl req -x509 -nodes -out ${CERTIFY_PATH}.crt -keyout ${CERTIFY_PATH}.key \
    -subj "/C=PT/ST=OPO/L=Porto/O=42/OU=42/CN=${DOMAIN}/UID=${DOMAIN_NAME}"

# Expor as portas HTTP e HTTPS
EXPOSE 80 443

# Substituir variáveis de ambiente e iniciar o Nginx
CMD ["/bin/sh", "-c", "/bin/replace_env.sh && nginx -g 'daemon off;'"]
