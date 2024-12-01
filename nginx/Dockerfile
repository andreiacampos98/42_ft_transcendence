FROM nginx:1.19.0-alpine

# Instalar OpenSSL
RUN apk add --no-cache openssl

# Copiar o script de substituição de variáveis
COPY replace_env.sh /bin/replace_env.sh
RUN chmod +x /bin/replace_env.sh

# Copiar o arquivo de configuração do Nginx
COPY ./default.conf /etc/nginx/conf.d/default.conf

# Expor as portas HTTP e HTTPS
EXPOSE 80 443

# Substituir variáveis de ambiente e iniciar o Nginx
CMD ["/bin/sh", "-c", "/bin/replace_env.sh && nginx -g 'daemon off;'"]
