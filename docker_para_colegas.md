# Docker para colegas

## Instalación

```
$ sudo apt-get install docker.io docker-compose

$ sudo groupadd docker
$ sudo usermod -aG docker $USER

s sudo reboot
```

## Kubernetes

Instalar cluster local ( minikube )

https://minikube.sigs.k8s.io/docs/start/


Recuerda poner esto .bashrc

    alias kubectl="minikube kubectl --"



### Comandos cluster
   
    minikube start
    minikube dashboard --url
    minikube stop
    minikube status

### comandos kubectl

    kubectl run miapp --image=jrgavilanes/mi_nginx --port 8080

    kubectl get pods

    kubectl describe pod miapp

    kubectl expose pod miapp --type=LoadBalancer --port=8080 --target-port=80

    kubectl get services

    kubectl describe service miapp


minikube service --url miapp ( me devuelve la url exterior )



## Comandos Básicos Docker
```bash
docker run debian ping google.es

docker run -it debian /bin/bash

docker images

docker ps -a

docker create debian # devuelve container_id

docker start <container_id>
docker logs <container_id>
docker stop <container_id>
docker kill <container_id>

docker start -a <container_id>

docker exec -it <container_id> /bin/bash

# Cuánto ocupa y borra datos
docker system df -v
docker system prune -a

# Borrar volumes
docker volume prune

```

## Dockerfile
```
FROM debian
RUN apt update
CMD ["ping", "google.es"]
```

```
docker build -f Dockerfile .    # Si no pones -f va por defecto a Dockerfile
docker build -t jrgavilanes/proyecto:version .
```

### Imagen desde contenedor ( No recomendado)

docker commit -c 'CMD ["ping", "google.es"]' <container_id>


### Redireccionando puerto
```
docker run -p 5000:8080 <imagen_id>
```

Ejemplo de guay:
```
# Dockerfile
FROM debian
RUN apt update
RUN apt install -y python3 python3-pip
WORKDIR /app
CMD ["python3", "-m", "http.server"]
```

Rúlalo
```
docker -t imagen_juanra build .
docker run --name contenedor_juanra -p 5000:8000 imagen_juanra

curl localhost:5000
```

### Volumenes

```bash
docker run -it -v $(pwd):/app alpine sh
```

### Apine

dockerfile alpine con ssh
```
# Dockerfile.apihub

FROM alpine
RUN apk update 
RUN apk add openssh
RUN ssh-keygen -A

RUN adduser --disabled-password --gecos "" juanra
RUN echo "juanra:juanra" | chpasswd

WORKDIR /app
COPY app.sh .

CMD ["sh", "app.sh"]
```

### Docker-compose

docker-compose.yml
```
version: '3'

services: 
    apihub:
        build: 
            context: .
            dockerfile: Dockerfile.apihub
        
    
    app1:
        build: 
            context: .
            dockerfile: Dockerfile.apihub        
```

```
docker-compose up
docker-compose up --build
docker-compose down
```


## EJEMPLO README apihub


#### Construye imagen
```
docker build -f Dockerfile.apihub -t jrgavilanes/apihub .
```

#### Construye contenedor
```
docker run -v $(pwd):/app --name apihub jrgavilanes/apihub
PING google.es (216.58.201.163): 56 data bytes
64 bytes from 216.58.201.163: seq=0 ttl=48 time=27.577 ms
64 bytes from 216.58.201.163: seq=1 ttl=48 time=65.366 ms
...
```

#### Arranca contenedor
```
docker start apihub
apihub

docker ps
CONTAINER ID        IMAGE                COMMAND             CREATED             STATUS              PORTS               NAMES
14b76d451e34        jrgavilanes/apihub   "ping google.es"    38 seconds ago      Up 8 seconds                            apihub

docker logs apihub 
PING google.es (216.58.201.163): 56 data bytes
64 bytes from 216.58.201.163: seq=0 ttl=48 time=27.577 ms
64 bytes from 216.58.201.163: seq=1 ttl=48 time=65.366 ms
64 bytes from 216.58.201.163: seq=2 ttl=48 time=248.764 ms
64 bytes from 216.58.201.163: seq=3 ttl=48 time=67.446 ms
```

#### Detén contenedor
```
docker stop apihub # En 10 segundos hace kill

docker kill apihub # Recomendado stop
```
