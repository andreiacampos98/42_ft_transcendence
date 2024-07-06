FROM alpine:3.20

EXPOSE 8002

RUN mkdir /code
WORKDIR /code

COPY . .

RUN apk add --update --no-cache python3-dev python3 py3-pip && ln -sf python3 /usr/bin/python \
    && python3 -m venv /code/.venv \
    && /code/.venv/bin/pip install --no-cache -r requirements.txt \
    && rm -rf /var/cache/apk/*

CMD ["/code/.venv/bin/python", "manage.py", "runserver", "0.0.0.0:8002"]
