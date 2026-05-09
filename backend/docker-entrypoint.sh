#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ "${DATABASE_URL#postgresql://}" != "$DATABASE_URL" ]; then
  database_url_without_scheme="${DATABASE_URL#postgresql://}"
  database_credentials="${database_url_without_scheme%@*}"
  database_host_and_name="${database_url_without_scheme#*@}"

  export SPRING_DATASOURCE_URL="jdbc:postgresql://${database_host_and_name}"
  export SPRING_DATASOURCE_USERNAME="${database_credentials%%:*}"
  export SPRING_DATASOURCE_PASSWORD="${database_credentials#*:}"
fi

exec java -jar app.jar
