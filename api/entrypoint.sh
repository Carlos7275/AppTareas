#!/bin/sh
set -e

ENV_FILE=.env

echo "Ejecutando EntryPoint..."

# Esperar dependencias
for host in "mysql:3306" "redis:6379" "rabbitmq:5672"; do
  service=$(echo $host | cut -d: -f1)
  port=$(echo $host | cut -d: -f2)
  echo "Esperando a $service en $port..."
  while ! nc -z $service $port; do
    sleep 1
  done
  echo "$service listo!"
done

echo "Creando el .env"
# Crear .env si no existe
if [ ! -f "$ENV_FILE" ]; then
  cat <<EOL > $ENV_FILE
PORT=3000
jwtSecret="*53kr374jw7~!!"
expireTime='5m'
ignoreExpiration="false"
ormConfig_type=mysql
ormConfig_host=mysql
ormConfig_port="3306"
ormConfig_username="docker"
ormConfig_password="rootpassword"
ormConfig_database="tareas"
ormConfig_logging="false"
ormConfig_synchronize=true
ormConfig_entities=["dist/**/*.entity{.ts,.js}"]
ormConfig_schema="public"
NODE_ENV=$NODE_ENV
FRONT_URL=["http://localhost", "http://host.docker.internal", "*"]
REDIS_URL="redis://redis:6379"
RABBITMQ_URL=amqp://user:password@rabbitmq:5672
RABBITMQ_QUEUE=report_queue
EOL
else
  sed -i 's/ormConfig_synchronize=true/ormConfig_synchronize=false/' $ENV_FILE
fi

# Ejecutar la app según NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
  echo "Iniciando app en PRODUCCIÓN..."
  npm run build
  exec node dist/src/main.js
else
  echo "Iniciando app en DESARROLLO..."
  exec npm run start:dev
fi
