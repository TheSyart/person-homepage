import { afterEach, vi } from 'vitest';

class TestIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
  vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);
});
