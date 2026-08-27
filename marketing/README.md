# Materiales de Marketing y Documentación de Usuario

- **`FamilyFinance-Presentacion.pptx`** — presentación de marketing (10 slides), generada con `pptxgenjs`. Incluye capturas reales de la app.
- **`FamilyFinance-Manual.html`** — manual de usuario simplificado, autocontenido (imágenes embebidas), pensado para compartir como un link.

## Regenerar

```bash
npm install
node gen_icons.cjs   # regenera los íconos usados en la presentación
node gen_deck.cjs    # regenera FamilyFinance-Presentacion.pptx
```

El manual (`FamilyFinance-Manual.html`) se generó manualmente combinando `manual_template.html` (no versionado) con capturas de pantalla reales de la app — para actualizarlo, edita el HTML directamente.
