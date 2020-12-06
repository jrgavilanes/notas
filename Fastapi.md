# Apuntes FastApi

https://training.talkpython.fm/courses/getting-started-with-fastapi

## API mínima

```python
import fastapi
import uvicorn

api = fastapi.FastAPI()

@api.get('/api/calculate')
def calculate():
    return 2+2

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

