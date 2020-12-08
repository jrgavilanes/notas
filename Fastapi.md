# Apuntes FastApi

https://training.talkpython.fm/courses/getting-started-with-fastapi

## API mínima

PYTHON >= 3.6

requirements.txt
```python
fastapi
uvicorn
```

main.py
```python
import fastapi
import uvicorn

api = fastapi.FastAPI()

@api.get('/api/calculate')
def calculate():
    return 2+2

if __name__ == '__main__':
    uvicorn.run(api, host="0.0.0.0", port=8000)
```

## Tipos Sugeridos

```python
running_max: Optional[int] = None

def counter(items: Iterable[Item]) -> int:
    total=0
    # ...
    return total

```

## Tipos Pydantic

```python
from pydantic import BaseModel
from typing import List, Optional
import datetime

class Order(BaseModel):
    item_id: str
    price: float
    cantidad: Optional[int]=0
    pages_visited: Optional[List[int]] = []
    created_date: Optional[datetime.datetime] = None

order_json = {
    'item_id': 123,
    'price': "1.23",
    'created_date': datetime.datetime.now()
}

o = Order(**order_json)
print(o)
```

```bash
(venv) vagrant@ubuntu-focal:~/code$ /home/vagrant/venv/bin/python /home/vagrant/code/main.py
item_id='123' price=1.23 cantidad=0 pages_visited=[] created_date=datetime.datetime(2020, 12, 6, 18, 37, 7, 32010)
```

## Métodos asíncronos

```python
import fastapi
router = fastapi.APIRouter()

@router.get('/api/weather'):
async def weather(city:str, coutry:Optional[str] = 'US', units:str='metric'):
    report = await open_weather_service.get_report_async(city, country, units)
    return report
```

## Renderiza plantillas

```python
templates = Jinja2Templates(directory="templates")

@router.get('/')
def home(request: Request):
    return template.TemplateResponse('index.html', {'request':request})
```

## Códigos de respuesta
```python
@router.get('/api/weather/{city}')
async def weather(loc: Location = Depends()):
    try:
        return await openweather_service.get_report(loc.city, loc.country)
    except ValidationError as ve:
        return fastapi.Response(content=ve.error_msg, status_code=ve.status_code)
    except Exception as x:
        print(f"Petada del server: {x}")
        return fastapi.Response(content="Error interno", status_code=500)
```


## Modificado datos desde la API

```python
from pydantic import BaseModel

class Location(BaseModel):
    city: str
    country: Optional[str]='ES'
    state: Optional[str]=None

class ReportSubmittal(BaseModel):
    location: Location
    description: str

@router.post('/api/reports', name='reports')
async def reports_post(report:ReportSubmittal):
    return await report_service.add_report(report.description, report.location)
```

## Topología / arquitectura

NGINX -> GUNICORN -> UVICORN

### Instalación en servidor Ubuntu
```shell
sudo apt update
sudo apt upgrade -y
sudo apt install -y -q build-essential git unzip zip nload tree
sudo apt install -y -q python3-pip python3-dev python3-venv
sudo apt install -y nginx
sudo cp /usr/share/zoneinfo/Europe/Madrid /etc/localtime

cd /mi_app
python3 -m venv venv
source venv/bin/activate
pip install gunicorn uvloop httptools 
echo "source /mi_app/venv/bin/activate" >> ~/.bashrc
pip install -r /mi_app/requirements.txt

# sudo apt install fail2ban -y
# sudo ufw allow 22
# sudo ufw allow 80
# sudo ufw allow 443
# sudo ufw enable

reboot

```

#### Arranca Gunicorn como servicio (SystemD)

mi_app.service
```
# Instalar como servicio
# sudo cp ./mi_app.service /etc/systemd/system/
# sudo systemctl start mi_app
# sudo systemctl status mi_app
# sudo systemctl enable mi_app
# sudo systemctl reload mi_app
# sudo systemctl stop mi_app

[Unit]
Description=gunicorn uvicorn service from janrax
After=syslog.target

[Service]
ExecStart=/mi_app/venv/bin/gunicorn -b 127.0.0.1:8000 -w 4 -k uvicorn.workers.UvicornWorker main:api --name mi_app_svc --chdir /mi_app --access-logfile /mi_app/logs/web_access.log --error-logfile /mi_app/logs/web_errors.log --user vagrant

# \/ \/ <- Added post recording for better restart perf.
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
# /\ /\ <- Added post recording for better restart perf.

# Requires systemd version 211 or newer
RuntimeDirectory=/mi_app
Restart=always
Type=notify
StandardError=syslog
NotifyAccess=all


[Install]
WantedBy=multi-user.target
```

```shell
sudo cp ./mi_app.service /etc/systemd/system/
sudo systemctl start mi_app
sudo systemctl enable mi_app
```

#### Configura nginx

minimo.nginx
```
##
# sudo cp minimo.nginx /etc/nginx/sites-available/default
# sudo service nginx restart
##

server {

    listen 80 ;
    listen [::]:80 ;
    server_name pru.codekai.es;

    location / {
        try_files $uri @yourapplication;
    }

    location @yourapplication {
        gzip            on;
        gzip_buffers    8 256k;

        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Protocol $scheme;
    }

}
```

Securiza con Let's Encript
```shell
sudo curl -o- https://raw.githubusercontent.com/vinyll/certbot-install/master/install.sh | bash
sudo apt install python3-certbot-nginx
sudo certbot --nginx -d pru.codekai.es -d www.pru.codekai.es
```


final.nginx
```
##
# sudo service nginx restart
##

server {

    server_name pru.codekai.es; # managed by Certbot

    location / {
        try_files $uri @yourapplication;
    }

    location @yourapplication {
        gzip            on;
        gzip_buffers    8 256k;

        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Protocol $scheme;
    }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/pru.codekai.es/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/pru.codekai.es/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

server {

    if ($host = pru.codekai.es) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80 ;
    listen [::]:80 ;
    server_name pru.codekai.es;
    return 404; # managed by Certbot
}
```
