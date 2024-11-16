all:
	docker compose up --build

detach:
	docker compose up --build -d

django:
	docker exec -it django-container sh -c 'source /.venv/bin/activate; sh'

nginx:
	docker exec -it nginx-container sh

migrations:
	docker exec -it django-container sh -c \
		'source /.venv/bin/activate; \
		python3 manage.py makemigrations; \
		python3 manage.py migrate'

clean:
	sudo rm -rf \
		data/  \
		backend/backend/__pycache__/  \
		backend/pong/__pycache__/ \
		backend/pong/migrations/__pycache__/ \
		backend/pong/templatetags/__pycache__/ \
		backend/pong/migrations/*_initial.py \
		backend/pong/migrations/0*.py

	rm -rf backend/media/upload/*
	mkdir data/

prune:
	docker system prune

down:
	docker compose down

ps:
	docker compose ps

re: down all

.SILENT:
