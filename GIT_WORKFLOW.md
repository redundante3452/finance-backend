# Flujo de Trabajo Git (Gitflow Simplificado)

Este proyecto sigue una estrategia de ramas para mantener un historial limpio y ordenado.

## Ramas Principales

- **`main`**: Código en producción. Estable y probado.
- **`develop`**: Rama de integración. Contiene las últimas funcionalidades listas para la próxima versión.

## Ramas de Soporte

- **`feature/<nombre-funcionalidad>`**: Para desarrollar nuevas características. Se crean desde `develop` y se fusionan de vuelta a `develop`.
    - Ejemplo: `feature/modulo-usuarios`
- **`fix/<nombre-error>`**: Para corregir errores en desarrollo.
- **`hotfix/<nombre-error>`**: Para corregir errores críticos en producción.

## Convención de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/es) para los mensajes:

- `feat`: Nueva funcionalidad
- `fix`: Corrección de errores
- `docs`: Cambios en documentación
- `style`: Cambios de formato (espacios, puntos y comas)
- `refactor`: Refactorización de código sin cambios de lógica
- `test`: Añadir o corregir pruebas
- `chore`: Tareas de mantenimiento, configuración de build, etc.

### Ejemplo
`feat(users): agregar endpoint para crear usuario`
