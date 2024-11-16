FROM nginx:1.19.0-alpine

RUN apk add --no-cache openssl

COPY ./default.conf /etc/nginx/conf.d/default.conf


RUN openssl req -x509 -nodes -out /etc/ssl/private/anaraujo.csr -keyout /etc/ssl/private/anaraujo.key \
            -subj "/C=PT/ST=OPO/L=Porto/O=42/OU=42/CN=anaraujo.42.fr/UID=anaraujo"