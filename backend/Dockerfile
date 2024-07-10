FROM alpine:3.20

EXPOSE 8002

RUN mkdir /code
WORKDIR /code

COPY . .

RUN apk add --update --no-cache python3-dev python3 py3-pip gcc musl-dev libpq-dev \
    && ln -sf python3 /usr/bin/python \
    && python3 -m venv /.venv \
    && source /.venv/bin/activate \
    && python3 -m ensurepip \
    && pip3 install --no-cache -r requirements.txt \
    && rm -rf /var/cache/apk/*




CMD source /.venv/bin/activate && python3 ./manage.py runserver 0.0.0.0:8002