import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

// Sem `test.globals: true`, o auto-cleanup do Testing Library nao se
// registra sozinho -- sem isso, o DOM de um teste vaza pro proximo.
afterEach(() => {
  cleanup()
})

// Polyfills que base-ui/@radix-like headless UI costumam precisar em jsdom
// (nao existem de verdade num DOM simulado) -- sem isso, componentes como
// AlertDialog/Switch lancam erro ao tentar abrir/fechar em teste.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
