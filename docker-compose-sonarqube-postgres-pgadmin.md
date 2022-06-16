# local dev 


notas: usuario por defecto sonarqube: admin | admin

según pagina hay que configurar estos datos en host-linux

https://hub.docker.com/_/sonarqube

```
sudo sysctl -w vm.max_map_count=524288
sudo sysctl -w fs.file-max=131072
# sudo ulimit -n 131072
# sudo ulimit -u 8192
```

docker-compose.yml
```yml
version: '3'
services:
  postgres:
    container_name: container-postgresdb
    image: postgres
    hostname: postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: root
      POSTGRES_DB: sonarqube
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - postgresql:/var/lib/postgresql
    restart: unless-stopped

  pgadmin:
    image: dpage/pgadmin4
    depends_on:
      - postgres
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: root@root.com
      PGADMIN_DEFAULT_PASSWORD: root
    restart: unless-stopped
    
  sonarqube:
    image: sonarqube
    depends_on:
      - postgres
    ports:
      - 9000:9000    
    environment:
      - SONARQUBE_JDBC_URL=jdbc:postgresql://postgres:5432/sonarqube
      - SONARQUBE_JDBC_USERNAME=root
      - SONARQUBE_JDBC_PASSWORD=root
    volumes:
      - sonarqube_conf:/opt/sonarqube/conf
      - sonarqube_data:/opt/sonarqube/data

volumes:
  postgres-data:
  postgresql:
  sonarqube_conf:
  sonarqube_data:

```