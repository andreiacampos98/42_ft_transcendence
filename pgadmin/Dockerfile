FROM elestio/pgadmin:REL-8_7

# WORKDIR /pgadmin4

COPY servers.json servers.json

CMD python3 setup.py load-servers servers.json --replace