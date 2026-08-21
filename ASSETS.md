# 🖼️ Guía de imágenes — dónde y con qué nombre subirlas

La aplicación está diseñada para verse **completa y profesional sin ninguna foto**: usa un logo **SVG
original**, gradientes y avatares generados por iniciales. Por eso **ninguna imagen es obligatoria**.

Esta guía es para cuando quieras **personalizar** con tus propias imágenes. **No inventé ninguna foto**:
donde iría una, encontrarás un placeholder o un elemento vectorial. Tú decides cuáles agregar.

> Regla de oro: sube solo imágenes **propias** o con **licencia clara**. Evita logos oficiales, fotos de
> personas sin autorización o capturas de sistemas institucionales (ver el aviso de IP del README).

---

## 1) Capturas para el README _(recomendado)_

Para que tu portafolio luzca, agrega capturas de la app.

| Qué                     | Dónde subirla                     | Nombre sugerido   | Tamaño ideal     |
| ----------------------- | --------------------------------- | ----------------- | ---------------- |
| Landing / portada       | `docs/screenshots/`               | `landing.png`     | 1600×1000 px     |
| Dashboard de usuario    | `docs/screenshots/`               | `dashboard.png`   | 1600×1000 px     |
| Mapa del parqueadero    | `docs/screenshots/`               | `mapa.png`        | 1600×1000 px     |
| Simulador IoT (admin)   | `docs/screenshots/`               | `iot.png`         | 1600×1000 px     |

Luego **descomenta** las líneas `![...](docs/screenshots/....png)` en el `README.md`.

---

## 2) Logo propio _(opcional)_

Hoy el logo es un **SVG vectorial original** (componente `LogoMark` + `apps/web/public/favicon.svg`).
Si tienes tu propio logo:

| Qué                          | Dónde subirlo                          | Nombre        | Formato/Tamaño          |
| ---------------------------- | -------------------------------------- | ------------- | ----------------------- |
| Ícono del logo (marca)       | `apps/web/public/brand/`               | `logo.svg`    | SVG cuadrado (o 512×512 PNG) |
| Favicon (pestaña navegador)  | `apps/web/public/`                     | `favicon.svg` | SVG (reemplaza el actual)   |

> Si subes `apps/web/public/brand/logo.svg` y quieres que la app lo use en lugar del SVG por defecto,
> **avísame y lo conecto** (es un cambio de un archivo en `src/components/brand/Logo.tsx`).

---

## 3) Imagen del _hero_ / login _(opcional)_

El _landing_ y el login usan un panel con **gradiente rojo CUC** y una visualización esquemática (sin foto).
Si prefieres una imagen de fondo (por ejemplo una foto/render propio del campus o del parqueadero):

| Qué                        | Dónde subirla                | Nombre         | Formato/Tamaño       |
| -------------------------- | ---------------------------- | -------------- | -------------------- |
| Fondo del hero/login       | `apps/web/public/images/`    | `hero.webp`    | 1600×2000 px (vertical) |

> **Avísame** si la agregas y quiero que la use: conecto la imagen respetando el diseño (con overlay para
> mantener la legibilidad del texto). Usa una imagen **propia** o con licencia libre.

---

## 4) Imagen para compartir en redes (Open Graph) _(opcional)_

Para que al compartir el link aparezca una tarjeta con imagen:

| Qué                        | Dónde subirla                | Nombre           | Formato/Tamaño |
| -------------------------- | ---------------------------- | ---------------- | -------------- |
| Preview social             | `apps/web/public/images/`    | `og-image.png`   | 1200×630 px    |

Si la agregas, añade estas etiquetas dentro de `<head>` en `apps/web/index.html` (o pídeme que lo haga):

```html
<meta property="og:title" content="ApparcaCUC — Smart Parking (Demo)" />
<meta property="og:description" content="Encuentra, reserva y gestiona tu estacionamiento de forma inteligente." />
<meta property="og:image" content="/images/og-image.png" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

---

### Resumen rápido

- **Obligatorio:** nada. La app funciona y se ve bien sin imágenes.
- **Recomendado:** capturas en `docs/screenshots/` para el README.
- **Opcional:** logo propio, foto de hero, imagen OG.

Cuando subas cualquiera de las opcionales que requieren “conexión” (logo, hero), **dime cuáles** y las
integro en el código.
