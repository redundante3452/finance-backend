# 🚀 Pasos Rápidos para Desplegar

## 1️⃣ Configurar Base de Datos en la Nube

### Opción Recomendada: Neon (Gratis)
1. Ve a https://neon.tech y crea una cuenta
2. Click en "Create Project"
3. Copia las credenciales de conexión:
   - Host
   - Database
   - Username  
   - Password

## 2️⃣ Desplegar en Vercel

### Desde GitHub:
1. Ve a https://vercel.com
2. Click en "Add New" → "Project"
3. Selecciona tu repositorio `finance-backend`
4. En "Environment Variables", agrega:
   ```
   DB_HOST=tu-host.neon.tech
   DB_PORT=5432
   DB_USERNAME=tu-usuario
   DB_PASSWORD=tu-password
   DB_NAME=tu-database
   JWT_SECRET=minimo_32_caracteres_muy_seguro_para_produccion
   NODE_ENV=production
   FRONTEND_URL=https://tu-frontend.vercel.app
   ```
5. Click en "Deploy"

## 3️⃣ Verificar Despliegue

Prueba que funcione:
```bash
# Health check
curl https://tu-backend.vercel.app/

# API docs
https://tu-backend.vercel.app/api

# Registrar usuario de prueba
curl -X POST https://tu-backend.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test User"}'
```

## 📝 Notas Importantes

- ✅ JWT_SECRET debe tener mínimo 32 caracteres
- ✅ synchronize está deshabilitado en producción (seguridad)
- ✅ SSL habilitado automáticamente para Neon/Vercel Postgres
- ✅ CORS configurado para aceptar tu frontend en producción

## 🆘 ¿Problemas?

Ver guía completa: `DEPLOY_GUIDE.md`
