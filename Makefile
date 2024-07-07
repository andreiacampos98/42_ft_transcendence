all:
	docker compose up --build

detach:
	docker compose up --build -d

django:
	docker exec -it django sh -c 'source /.venv/bin/activate; sh'

prune:
	docker system prune

down:
	docker compose down

re: down all

.SILENT:
