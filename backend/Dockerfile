FROM alpine:3.20

EXPOSE 8002

RUN mkdir /code
RUN chmod -R 755 /code
WORKDIR /code

COPY . .

RUN apk add --update --no-cache python3-dev python3 py3-pip gcc musl-dev libpq-dev openssl \
    && ln -sf python3 /usr/bin/python \
    && python3 -m venv /.venv \
    && source /.venv/bin/activate \
    && python3 -m ensurepip \
    && pip3 install --no-cache -r requirements.txt \
    && pip install "channels[daphne]" \
    && pip install daphne \
    && rm -rf /var/cache/apk/*

CMD source /.venv/bin/activate \
    && openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
     -subj "/C=PT/ST=OPO/L=Porto/O=42/OU=42/CN=anaraujo.42.fr/UID=anaraujo" > /dev/null \
    && chmod 777 key.pem \
	&& python3 manage.py makemigrations \
	&& python3 manage.py migrate \
    && gunicorn backend.wsgi:application --bind 0.0.0.0:8002