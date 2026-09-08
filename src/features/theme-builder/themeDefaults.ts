import type { ThemeConfig } from '../../types'

export const defaultThemeConfig: ThemeConfig = {
  version: 1,
  style: {
    mode: 'light',
    primaryColor: '#b8860b',
    secondaryColor: '#8b6914',
    backgroundColor: '#faf7f2',
    surfaceColor: '#fffdf8',
    textColor: '#2c1810',
    mutedTextColor: '#6b5344',
    accentColor: '#c9a227',
    fontFamily: 'Inter, sans-serif',
    headingFontFamily: 'Cairo, Inter, sans-serif',
    borderRadius: 16,
  },
  layout: {
    sections: [
      { id: 'header', type: 'header', visible: true },
      { id: 'categories', type: 'categories', visible: true },
      { id: 'items', type: 'items', visible: true },
      { id: 'footer', type: 'footer', visible: true },
    ],
  },
  header: {
    showLogo: true,
    showName: true,
    showAddress: true,
    showPhone: true,
    alignment: 'center',
  },
  categories: { display: 'pills', sticky: true },
  items: {
    layout: 'cards',
    showImages: true,
    showDescription: true,
    showPrice: true,
    showVariants: true,
  },
  footer: { showAddress: true, showPhone: true, text: '' },
}

export function mergeTheme(partial?: Partial<ThemeConfig> | null): ThemeConfig {
  const d = defaultThemeConfig
  if (!partial) return structuredClone(d)
  return {
    version: 1,
    style: { ...d.style, ...partial.style },
    layout: {
      sections:
        partial.layout?.sections && partial.layout.sections.length > 0
          ? partial.layout.sections
          : structuredClone(d.layout.sections),
    },
    header: { ...d.header, ...partial.header },
    categories: { ...d.categories, ...partial.categories },
    items: { ...d.items, ...partial.items },
    footer: { ...d.footer, ...partial.footer },
  }
}
