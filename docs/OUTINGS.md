# Módulo Salidas (Outings) - Documentación Técnica

## Descripción General

El módulo **Salidas** permite gestionar gastos grupales cuando varias personas salen juntas (restaurante, bar, bolos, cine, etc.). El sistema registra qué consumió cada persona, quién pagó y cuánto, y al final calcula automáticamente **quién le debe dinero a quién**.

### Objetivos

- Eliminar la confusión típica de "¿cuánto te debo?" al final de una salida
- Permitir múltiples cuentas en una misma salida (varios lugares visitados)
- Soportar múltiples pagadores por cuenta
- Manejar propina/servicio (porcentaje o valor fijo)
- Generar un resultado claro: "X le debe $Y a Z"

---

## Modelo de Datos

```
┌─────────────┐
│   Outing    │ ─── Salida principal (ej: "Viernes con amigos")
├─────────────┤
│ id          │
│ name        │
│ date        │
│ userId      │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────────┐
│  Participant    │ ─── Persona que participa (no requiere cuenta en la app)
├─────────────────┤
│ id              │
│ name            │
│ outingId        │
└────────┬────────┘
         │
         │ 1:N                    1:N
         ▼                         │
┌─────────────────┐               │
│    Product      │◄──────────────┘
├─────────────────┤
│ id              │
│ name            │
│ price           │
│ quantity        │
│ participantId   │
│ accountId       │
└─────────────────┘

┌─────────────────┐
│ OutingAccount   │ ─── Cuenta/lugar dentro de la salida (ej: "Bolos", "Bar")
├─────────────────┤
│ id              │
│ name            │
│ outingId        │
│ hasService      │
│ serviceType     │ ─── PERCENTAGE | FIXED
│ serviceValue    │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│     Payer       │ ─── Registro de quién pagó y cuánto
├─────────────────┤
│ id              │
│ participantId   │
│ accountId       │
│ amount          │
└─────────────────┘
```

---

## Referencia de API

Todos los endpoints requieren autenticación JWT. Incluir header:
```
Authorization: Bearer <token>
```

Base URL: `/outings`

---

### 1. Crear Salida

Crea una nueva salida grupal.

```
POST /outings
```

**Request Body:**
```json
{
  "name": "Viernes con amigos"
}
```

**Response (201):**
```json
{
  "id": "uuid-de-la-salida",
  "name": "Viernes con amigos",
  "date": "2025-12-05T20:00:00.000Z",
  "userId": "uuid-del-usuario",
  "createdAt": "2025-12-05T20:00:00.000Z",
  "updatedAt": "2025-12-05T20:00:00.000Z"
}
```

**Ejemplo curl:**
```bash
curl -X POST http://localhost:3000/outings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Viernes con amigos"}'
```

---

### 2. Listar Salidas del Usuario

Obtiene todas las salidas creadas por el usuario autenticado.

```
GET /outings
```

**Response (200):**
```json
[
  {
    "id": "uuid-1",
    "name": "Viernes con amigos",
    "date": "2025-12-05T20:00:00.000Z",
    "userId": "uuid-del-usuario",
    "createdAt": "2025-12-05T20:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "name": "Cumpleaños de Juan",
    "date": "2025-11-20T19:00:00.000Z",
    "userId": "uuid-del-usuario",
    "createdAt": "2025-11-20T19:00:00.000Z"
  }
]
```

---

### 3. Obtener Detalle de Salida

Obtiene una salida con todos sus datos relacionados (participantes, cuentas, productos, pagadores).

```
GET /outings/:id
```

**Response (200):**
```json
{
  "id": "uuid-de-la-salida",
  "name": "Viernes con amigos",
  "date": "2025-12-05T20:00:00.000Z",
  "participants": [
    { "id": "p1", "name": "Juan" },
    { "id": "p2", "name": "Carlos" },
    { "id": "p3", "name": "Pepe" }
  ],
  "accounts": [
    {
      "id": "acc1",
      "name": "Bolos",
      "hasService": true,
      "serviceType": "PERCENTAGE",
      "serviceValue": 10,
      "products": [
        { "id": "prod1", "name": "Corona", "price": 8000, "quantity": 2, "participantId": "p2" },
        { "id": "prod2", "name": "Coca-Cola", "price": 3000, "quantity": 1, "participantId": "p1" }
      ],
      "payers": [
        { "id": "pay1", "participantId": "p2", "amount": 20000 }
      ]
    }
  ]
}
```

---

### 4. Agregar Participante

Agrega una persona a la salida. No necesita estar registrada en la app.

```
POST /outings/:id/participants
```

**Request Body:**
```json
{
  "name": "Juan"
}
```

**Response (201):**
```json
{
  "id": "uuid-del-participante",
  "name": "Juan",
  "outingId": "uuid-de-la-salida",
  "createdAt": "2025-12-05T20:05:00.000Z"
}
```

**Ejemplo curl:**
```bash
curl -X POST http://localhost:3000/outings/uuid-salida/participants \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan"}'
```

---

### 5. Crear Cuenta (Lugar)

Agrega una cuenta/lugar a la salida. Una salida puede tener múltiples cuentas (Bolos, Restaurante, Bar, etc.).

```
POST /outings/:id/accounts
```

**Request Body (con servicio en porcentaje):**
```json
{
  "name": "Bolos",
  "hasService": true,
  "serviceType": "PERCENTAGE",
  "serviceValue": 10
}
```

**Request Body (con servicio fijo):**
```json
{
  "name": "Restaurante",
  "hasService": true,
  "serviceType": "FIXED",
  "serviceValue": 15000
}
```

**Request Body (sin servicio):**
```json
{
  "name": "Bar",
  "hasService": false
}
```

**Response (201):**
```json
{
  "id": "uuid-de-la-cuenta",
  "name": "Bolos",
  "outingId": "uuid-de-la-salida",
  "hasService": true,
  "serviceType": "PERCENTAGE",
  "serviceValue": 10,
  "createdAt": "2025-12-05T20:10:00.000Z"
}
```

**Valores de serviceType:**
- `PERCENTAGE` - El valor es un porcentaje (ej: 10 = 10%)
- `FIXED` - El valor es un monto fijo en la moneda local

---

### 6. Agregar Producto (Consumo)

Registra lo que consumió una persona en una cuenta específica.

```
POST /outings/accounts/:accountId/products
```

**Request Body:**
```json
{
  "name": "Cerveza Corona",
  "price": 8000,
  "quantity": 2,
  "participantId": "uuid-del-participante"
}
```

**Response (201):**
```json
{
  "id": "uuid-del-producto",
  "name": "Cerveza Corona",
  "price": 8000,
  "quantity": 2,
  "participantId": "uuid-del-participante",
  "accountId": "uuid-de-la-cuenta",
  "createdAt": "2025-12-05T20:15:00.000Z"
}
```

**Nota importante:** Si el producto ya existe para ese participante con el mismo nombre y precio, la cantidad se incrementa automáticamente (no se crea un registro duplicado).

**Ejemplo curl:**
```bash
curl -X POST http://localhost:3000/outings/accounts/uuid-cuenta/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cerveza Corona",
    "price": 8000,
    "quantity": 1,
    "participantId": "uuid-participante"
  }'
```

---

### 7. Registrar Pago

Registra quién pagó y cuánto aportó a una cuenta. Una cuenta puede tener múltiples pagadores.

```
POST /outings/accounts/:accountId/payers
```

**Request Body:**
```json
{
  "participantId": "uuid-del-participante",
  "amount": 20000
}
```

**Response (201):**
```json
{
  "id": "uuid-del-pago",
  "participantId": "uuid-del-participante",
  "accountId": "uuid-de-la-cuenta",
  "amount": 20000,
  "createdAt": "2025-12-05T20:20:00.000Z"
}
```

**Ejemplo con múltiples pagadores:**
```bash
# Carlos paga 20.000
curl -X POST http://localhost:3000/outings/accounts/uuid-cuenta/payers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"participantId": "uuid-carlos", "amount": 20000}'

# Juan paga 5.000
curl -X POST http://localhost:3000/outings/accounts/uuid-cuenta/payers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"participantId": "uuid-juan", "amount": 5000}'
```

---

### 8. Calcular Deudas

Calcula el balance de cada participante y genera la lista de quién le debe a quién.

```
GET /outings/:id/calculate
```

**Response (200):**
```json
{
  "balances": [
    {
      "participantId": "p1",
      "participantName": "Juan",
      "totalConsumed": 3733.33,
      "totalPaid": 5000,
      "balance": 1266.67
    },
    {
      "participantId": "p2",
      "participantName": "Carlos",
      "totalConsumed": 16733.33,
      "totalPaid": 20000,
      "balance": 3266.67
    },
    {
      "participantId": "p3",
      "participantName": "Pepe",
      "totalConsumed": 3733.33,
      "totalPaid": 0,
      "balance": -3733.33
    }
  ],
  "debts": [
    {
      "fromParticipantId": "p3",
      "fromParticipantName": "Pepe",
      "toParticipantId": "p2",
      "toParticipantName": "Carlos",
      "amount": 3266.67
    },
    {
      "fromParticipantId": "p3",
      "fromParticipantName": "Pepe",
      "toParticipantId": "p1",
      "toParticipantName": "Juan",
      "amount": 466.66
    }
  ]
}
```

**Interpretación:**
- `balances`: Muestra el estado de cada persona
  - `totalConsumed`: Lo que consumió + su parte del servicio
  - `totalPaid`: Lo que pagó como aportador
  - `balance`: Positivo = le deben, Negativo = debe
- `debts`: Lista optimizada de transferencias necesarias
  - "Pepe debe $3.266,67 a Carlos"
  - "Pepe debe $466,66 a Juan"

---

## Algoritmo de Cálculo

### Paso 1: Calcular consumo por persona
```
consumo_productos = Σ(precio × cantidad) de cada producto
```

### Paso 2: Calcular servicio
```
Si serviceType = PERCENTAGE:
    servicio = subtotal_cuenta × (serviceValue / 100)
Si serviceType = FIXED:
    servicio = serviceValue

servicio_por_persona = servicio / cantidad_participantes
```

### Paso 3: Calcular consumo total
```
consumo_total = consumo_productos + servicio_por_persona
```

### Paso 4: Calcular balance
```
balance = total_pagado - consumo_total

Si balance > 0 → Le deben dinero
Si balance < 0 → Debe dinero
Si balance = 0 → Está cuadrado
```

### Paso 5: Resolver deudas
El algoritmo cruza los balances positivos (acreedores) con los negativos (deudores) para generar la lista mínima de transferencias necesarias.

---

## Guía de Interfaz de Usuario

### Pantalla Principal de Salida

```
┌─────────────────────────────────────────────────────────┐
│  ← Salidas          VIERNES CON AMIGOS           ⚙️    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👥 PARTICIPANTES                            [+ Agregar]│
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  Juan   │ │ Carlos  │ │  Pepe   │ │ Esteban │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📋 CUENTAS                                  [+ Nueva]  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🎳 BOLOS                              Subtotal: │   │
│  │                                         $22.000 │   │
│  │ ┌─────────────────────────────────────────────┐ │   │
│  │ │ Carlos                                      │ │   │
│  │ │  • Corona 8k         x2        $16.000     │ │   │
│  │ │                              [+ Producto]   │ │   │
│  │ └─────────────────────────────────────────────┘ │   │
│  │ ┌─────────────────────────────────────────────┐ │   │
│  │ │ Juan                                        │ │   │
│  │ │  • Coca-Cola 3k      x1         $3.000     │ │   │
│  │ │                              [+ Producto]   │ │   │
│  │ └─────────────────────────────────────────────┘ │   │
│  │ ┌─────────────────────────────────────────────┐ │   │
│  │ │ Pepe                                        │ │   │
│  │ │  • Manzana 3k        x1         $3.000     │ │   │
│  │ │                              [+ Producto]   │ │   │
│  │ └─────────────────────────────────────────────┘ │   │
│  │                                                 │   │
│  │ 💰 SERVICIO: 10%                     = $2.200   │   │
│  │ 💳 PAGADORES:                                   │   │
│  │     Carlos: $20.000                             │   │
│  │     Juan: $4.200                    [+ Pagador] │   │
│  │                                                 │   │
│  │                      TOTAL: $24.200             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🍽️ RESTAURANTE                        Subtotal: │   │
│  │                                         $45.000 │   │
│  │ ...                                             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │            🧮  CALCULAR DEUDAS                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Modal: Agregar Producto

```
┌────────────────────────────────────────┐
│         AGREGAR PRODUCTO               │
│              a Juan                    │
├────────────────────────────────────────┤
│                                        │
│  Nombre del producto                   │
│  ┌──────────────────────────────────┐  │
│  │ Cerveza Corona                   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Precio unitario                       │
│  ┌──────────────────────────────────┐  │
│  │ $ 8.000                          │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Cantidad                              │
│  ┌────┐                                │
│  │ -  │    1    │ +  │                │
│  └────┘                                │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │           AGREGAR                │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

### Modal: Configurar Servicio

```
┌────────────────────────────────────────┐
│         SERVICIO / PROPINA             │
├────────────────────────────────────────┤
│                                        │
│  ¿Hubo servicio?                       │
│                                        │
│  ┌────────────┐   ┌────────────┐       │
│  │    SÍ     │   │     NO     │       │
│  └────────────┘   └────────────┘       │
│                                        │
│  ─────────────────────────────────     │
│                                        │
│  Tipo de servicio:                     │
│                                        │
│  ○ Porcentaje (%)                      │
│    ┌──────────────────────────────┐    │
│    │ 10                           │ %  │
│    └──────────────────────────────┘    │
│                                        │
│  ○ Valor fijo ($)                      │
│    ┌──────────────────────────────┐    │
│    │ $ 15.000                     │    │
│    └──────────────────────────────┘    │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │           GUARDAR                │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

### Pantalla: Resultado de Deudas

```
┌─────────────────────────────────────────────────────────┐
│  ←                RESULTADO FINAL                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 RESUMEN POR PERSONA                                 │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ CARLOS                                          │   │
│  │ Consumió: $16.733    Pagó: $20.000             │   │
│  │                          Balance: +$3.267  ✅  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ JUAN                                            │   │
│  │ Consumió: $3.733     Pagó: $4.200              │   │
│  │                          Balance: +$467    ✅  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ PEPE                                            │   │
│  │ Consumió: $3.733     Pagó: $0                  │   │
│  │                          Balance: -$3.733  ❌  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  💸 QUIÉN LE DEBE A QUIÉN                               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │   Pepe  ──────────────────────────▶  Carlos    │   │
│  │                 $3.267                          │   │
│  │                                                 │   │
│  │   Pepe  ──────────────────────────▶  Juan      │   │
│  │                 $467                            │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           📤  COMPARTIR RESULTADO               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Flujo de Uso Recomendado

```
┌──────────────────┐
│ 1. Crear Salida  │
│   POST /outings  │
└────────┬─────────┘
         │
         ▼
┌────────────────────────┐
│ 2. Agregar Participantes│
│   POST /outings/:id/    │
│        participants     │
│   (repetir por persona) │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ 3. Crear Cuenta        │
│   POST /outings/:id/   │
│        accounts        │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────────────┐
│ 4. Agregar Productos           │
│   POST /outings/accounts/      │
│        :accountId/products     │
│   (por cada consumo)           │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ 5. Registrar Pagadores         │
│   POST /outings/accounts/      │
│        :accountId/payers       │
│   (por cada persona que pagó)  │
└────────┬───────────────────────┘
         │
         ▼
    ┌────┴────┐
    │ ¿Otro   │ ──SÍ──▶ Volver al paso 3
    │ lugar?  │
    └────┬────┘
         │ NO
         ▼
┌────────────────────────┐
│ 6. Calcular Deudas     │
│   GET /outings/:id/    │
│       calculate        │
└────────────────────────┘
```

---

## Ejemplo Completo: Noche de Bolos

### Paso 1: Crear la salida
```bash
curl -X POST http://localhost:3000/outings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Viernes de Bolos"}'

# Response: { "id": "outing-123", ... }
```

### Paso 2: Agregar participantes
```bash
# Agregar a Carlos
curl -X POST http://localhost:3000/outings/outing-123/participants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Carlos"}'
# Response: { "id": "part-carlos", ... }

# Agregar a Juan
curl -X POST http://localhost:3000/outings/outing-123/participants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan"}'
# Response: { "id": "part-juan", ... }

# Agregar a Pepe
curl -X POST http://localhost:3000/outings/outing-123/participants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Pepe"}'
# Response: { "id": "part-pepe", ... }
```

### Paso 3: Crear cuenta de Bolos
```bash
curl -X POST http://localhost:3000/outings/outing-123/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bolos",
    "hasService": true,
    "serviceType": "PERCENTAGE",
    "serviceValue": 10
  }'
# Response: { "id": "account-bolos", ... }
```

### Paso 4: Registrar consumos
```bash
# Carlos: 2 Coronas a $8.000 c/u
curl -X POST http://localhost:3000/outings/accounts/account-bolos/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Corona",
    "price": 8000,
    "quantity": 2,
    "participantId": "part-carlos"
  }'

# Juan: 1 Coca-Cola a $3.000
curl -X POST http://localhost:3000/outings/accounts/account-bolos/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coca-Cola",
    "price": 3000,
    "quantity": 1,
    "participantId": "part-juan"
  }'

# Pepe: 1 Manzana a $3.000
curl -X POST http://localhost:3000/outings/accounts/account-bolos/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manzana",
    "price": 3000,
    "quantity": 1,
    "participantId": "part-pepe"
  }'
```

### Paso 5: Registrar pagadores
```bash
# Carlos pagó $20.000
curl -X POST http://localhost:3000/outings/accounts/account-bolos/payers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "part-carlos",
    "amount": 20000
  }'

# Juan pagó $4.200
curl -X POST http://localhost:3000/outings/accounts/account-bolos/payers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "part-juan",
    "amount": 4200
  }'
```

### Paso 6: Calcular deudas
```bash
curl -X GET http://localhost:3000/outings/outing-123/calculate \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado:**
```json
{
  "balances": [
    {
      "participantId": "part-carlos",
      "participantName": "Carlos",
      "totalConsumed": 16733.33,
      "totalPaid": 20000,
      "balance": 3266.67
    },
    {
      "participantId": "part-juan",
      "participantName": "Juan",
      "totalConsumed": 3733.33,
      "totalPaid": 4200,
      "balance": 466.67
    },
    {
      "participantId": "part-pepe",
      "participantName": "Pepe",
      "totalConsumed": 3733.33,
      "totalPaid": 0,
      "balance": -3733.33
    }
  ],
  "debts": [
    {
      "fromParticipantName": "Pepe",
      "toParticipantName": "Carlos",
      "amount": 3266.67
    },
    {
      "fromParticipantName": "Pepe",
      "toParticipantName": "Juan",
      "amount": 466.66
    }
  ]
}
```

**Interpretación:**
- Pepe debe **$3.266,67** a Carlos
- Pepe debe **$466,66** a Juan

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Datos de entrada inválidos (validación fallida) |
| 401 | No autenticado (token JWT inválido o ausente) |
| 404 | Recurso no encontrado (salida, cuenta, participante) |
| 500 | Error interno del servidor |

---

## Consideraciones Técnicas

1. **Productos duplicados**: Si se agrega un producto con el mismo nombre, precio y participante, la cantidad se incrementa automáticamente.

2. **Servicio**: Se divide en partes iguales entre TODOS los participantes de la salida, no solo los que consumieron en esa cuenta.

3. **Múltiples pagadores**: Una cuenta puede tener varios pagadores. El sistema considera todo el dinero aportado para calcular quién pagó de más o de menos.

4. **Precisión decimal**: Los cálculos usan precisión de 2 decimales para evitar errores de redondeo.

5. **Optimización de deudas**: El algoritmo de resolución minimiza el número de transferencias necesarias entre personas.

