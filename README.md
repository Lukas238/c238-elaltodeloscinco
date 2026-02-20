# El Alto de los Cinco - Sitio Web

Sitio web estático con Jekyll para promocionar el desarrollo de chacras "El Alto de los Cinco" en Villa General Belgrano, Córdoba.

## 🚀 Estructura del Proyecto

```
/
├── index.html                    # Landing "Próximamente" (pública)
├── ac7f92b3e5d8/
│   └── index.html               # Sitio real completo (URL tokenizada)
├── _config.yml                   # Configuración Jekyll
├── _layouts/
│   └── default.html             # Layout base
├── Gemfile                       # Dependencias Ruby/Jekyll
├── assets/
│   ├── css/
│   │   └── style.css            # Estilos principales
│   ├── js/
│   │   └── main-v2.js           # JavaScript principal
│   ├── images/                  # Imágenes y recursos visuales
│   └── videos/                  # Videos promocionales
├── docs/                        # Documentación del proyecto
└── backup/                      # Versiones anteriores
```

## 🔒 Acceso al Sitio

- **Landing pública:** `https://elaltodeloscinco.com.ar/`
- **Sitio completo (tokenizado):** `https://elaltodeloscinco.com.ar/ac7f92b3e5d8/`

El sitio real está oculto bajo una URL tokenizada, accesible solo con el link completo.

## 📦 Deployment

### Desarrollo local

1. **Instalar dependencias:**
   ```bash
   bundle install
   ```

2. **Ejecutar servidor de desarrollo:**
   ```bash
   bundle exec jekyll serve
   ```

3. **Abrir en navegador:**
   ```
   http://localhost:4000              # Landing "Próximamente"
   http://localhost:4000/ac7f92b3e5d8/  # Sitio completo
   ```

### Build para producción

```bash
bundle exec jekyll build
```
Los archivos generados estarán en `_site/`

### GitHub Pages

El sitio está configurado para funcionar automáticamente con GitHub Pages. Solo necesitas:
1. Push a la rama `main`
2. Configurar GitHub Pages para usar la rama `main` y carpeta raíz `/`

## 📁 Estructura del Proyecto

```
src/
├── _config.yml          # Configuración de Jekyll
├── _layouts/            # Templates de página
│   └── default.html
├── _includes/           # Componentes reutilizables
│   ├── header.html
│   └── footer.html
├── _sass/               # Estilos SCSS
│   └── main.scss
├── assets/
│   ├── css/
│   │   └── main.scss    # Punto de entrada de estilos
│   ├── js/
│   │   └── main.js      # JavaScript principal
│   ├── images/          # Imágenes del sitio
│   ├── videos/          # Videos (drone, etc.)
│   └── docs/            # PDFs y documentos descargables
├── index.html           # Página principal
├── Gemfile              # Dependencias Ruby
└── README.md
```

## 🎨 Diseño y Estilo

### Paleta de Colores

- **Primary:** `#8B7355` (Marrón tierra elegante)
- **Secondary:** `#5A6B5D` (Verde oliva apagado)
- **Accent:** `#B89968` (Dorado envejecido)
- **Dark:** `#2C2A29` (Negro cálido)
- **Light:** `#F5F3F0` (Blanco cálido)

### Tipografía

- **Serif (Títulos):** Playfair Display
- **Sans-serif (Cuerpo):** Inter

### Espaciado

Sistema basado en 8px:
- XS: 8px
- SM: 16px
- MD: 24px
- LG: 48px
- XL: 96px

## 📱 Responsive

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

##  Comandos Útiles

```bash
# Limpiar caché
bundle exec jekyll clean

# Build sin watch
bundle exec jekyll build

# Servidor con drafts
bundle exec jekyll serve --drafts

# Servidor con livereload
bundle exec jekyll serve --livereload

# Build para GitHub Pages específicamente
JEKYLL_ENV=production bundle exec jekyll build
```

## ⚠️ Notas Importantes

- Los videos de drone deben ser comprimidos (<2MB para web hero)
- Las imágenes deben estar optimizadas (WebP cuando sea posible)
- No commitear archivos grandes directamente al repo (usar Git LFS o CDN)
- Mantener _config.yml sincronizado entre local y producción
