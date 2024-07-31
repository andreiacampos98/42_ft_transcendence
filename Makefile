all:
	docker compose up --build

detach:
	docker compose up --build -d

django:
	docker exec -it django sh -c 'source /.venv/bin/activate; sh'

migrations:
	docker exec -it django sh -c \
		'source /.venv/bin/activate; \
		python3 manage.py makemigrations; \
		python3 manage.py migrate'

clean:
	docker exec -it django sh -c \
		'rm -rf data/'

prune:
	docker system prune

down:
	docker compose down

re: down all

.SILENT:
