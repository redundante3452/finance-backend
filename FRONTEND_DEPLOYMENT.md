# 📱 Despliegue del Frontend Flutter

## ¿Necesito desplegar mi app Flutter?

**Depende de qué versión quieras distribuir:**

### 🎯 App Móvil (Android/iOS) - NO se despliega
- ✅ **Android**: Compila a APK/AAB
- ✅ **iOS**: Compila a IPA
- 📦 **Distribución**: Google Play, App Store, o instalación directa

**No necesitas Vercel ni ningún servidor para la app móvil.**

### 🌐 Flutter Web - SÍ se despliega
- ✅ Puedes compilar tu Flutter app a Web
- ✅ Desplegarla en Vercel/Netlify/etc
- ✅ Accesible desde navegador

---

## 🚀 Opción A: Solo App Móvil (Recomendado para empezar)

### 1. Configurar URL del Backend

En tu app Flutter, actualiza la URL del backend:

```dart
// lib/config/api_config.dart o similar
class ApiConfig {
  static const String baseUrl = 'https://tu-backend.vercel.app';
}
```

### 2. Compilar para Android

```bash
# APK para instalación directa
flutter build apk --release

# El APK estará en: build/app/outputs/flutter-apk/app-release.apk
```

### 3. Compilar para iOS (requiere Mac)

```bash
flutter build ios --release
```

### 4. Distribuir

**Para Testing:**
- **Android**: Envía el APK directamente
- **iOS**: Usa TestFlight

**Para Producción:**
- **Android**: Sube AAB a Google Play Console
- **iOS**: Sube a App Store Connect

---

## 🌐 Opción B: Flutter Web en Vercel

Si también quieres versión web:

### 1. Compilar Flutter a Web

```bash
flutter build web --release
```

### 2. Crear `vercel.json` en tu proyecto Flutter

```json
{
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 3. Desplegar en Vercel

```bash
# Desde el directorio de tu app Flutter
vercel --prod

# Especifica la carpeta build/web
```

O desde GitHub:
1. Push tu app Flutter a GitHub
2. Import en Vercel
3. Build Command: `flutter build web`
4. Output Directory: `build/web`

---

## 🔧 Configuración del Backend

Ya configuramos el backend para aceptar conexiones desde:
- ✅ App móvil (localhost durante desarrollo)
- ✅ Flutter Web en Vercel (en producción)

### Variables de Entorno del Backend

Recuerda configurar en Vercel (backend):

```bash
FRONTEND_URL=https://tu-frontend-flutter.vercel.app  # Si usas Flutter Web
# O déjalo vacío si solo usarás app móvil
```

El CORS ya está configurado para aceptar ambos:
- **Desarrollo**: Acepta cualquier origen (incluyendo emuladores)
- **Producción**: Solo acepta `FRONTEND_URL` específica

---

## 📊 Comparación

| Aspecto | App Móvil | Flutter Web |
|---------|-----------|-------------|
| **Despliegue** | No necesita servidor | Vercel/Netlify |
| **Distribución** | Stores/APK directo | URL web |
| **Performance** | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐ Bueno |
| **Offline** | ✅ Sí (con config) | ⚠️ Limitado |
| **Notificaciones** | ✅ Push nativas | ⚠️ Limitadas |
| **Acceso a hardware** | ✅ Completo | ❌ Limitado |
| **SEO** | N/A | ✅ Posible |

---

## 🎯 Mi Recomendación

### Para tu App de Finanzas:

1. **Empieza con App Móvil**
   - Mejor experiencia de usuario
   - Acceso a features nativas
   - No necesitas desplegar frontend

2. **Backend en Vercel**
   - Despliega solo el backend
   - Conéctate desde la app móvil

3. **Opcional: Agrega Web después**
   - Si necesitas acceso desde desktop
   - Flutter Web es fácil de agregar después

---

## 🔍 Configuración para Desarrollo

### Durante Desarrollo Local

Tu app móvil se conectará a:
```dart
// Para testing con backend local
static const String baseUrl = 'http://localhost:3000';

// Para testing con backend en Vercel
static const String baseUrl = 'https://tu-backend.vercel.app';
```

### Para Producción

```dart
static const String baseUrl = 'https://tu-backend.vercel.app';
```

---

## 📝 Checklist de Despliegue

### Backend (Vercel)
- [x] Backend desplegado en Vercel
- [x] Base de datos configurada (Neon/Vercel Postgres)
- [x] Variables de entorno configuradas
- [x] CORS configurado
- [x] API docs accesible en `/api`

### App Móvil
- [ ] Actualizar URL del backend en el código
- [ ] Probar conexión con backend en Vercel
- [ ] Compilar APK de release
- [ ] Probar instalación en dispositivo real
- [ ] (Opcional) Subir a Play Store
- [ ] (Opcional) Compilar para iOS

### Flutter Web (Opcional)
- [ ] Compilar a web (`flutter build web`)
- [ ] Desplegar en Vercel
- [ ] Configurar `FRONTEND_URL` en backend
- [ ] Verificar CORS

---

## 🆘 Problemas Comunes

### "No se puede conectar al backend desde la app"

1. **Verifica la URL**: Asegúrate de usar HTTPS
2. **CORS**: Ya está configurado, pero verifica en logs
3. **Certificado SSL**: En desarrollo, podrías necesitar permitir certificados no confiables

### "Funciona en desarrollo pero no en producción"

1. **URL hardcodeada**: Asegúrate de cambiar localhost por Vercel
2. **Variables de entorno**: Usa diferentes configs para dev/prod
3. **Permisos de internet**: Verifica `AndroidManifest.xml` y `Info.plist`

---

## 💡 Próximos Pasos

1. **Solo necesitas desplegar el backend en Vercel**
2. **La app móvil se compila y distribuye por stores**
3. **Flutter Web es opcional** (puedes agregarlo después)

**¡Tu backend ya está listo! Solo necesitas actualizar la URL en tu app Flutter y compilar.** 🚀
