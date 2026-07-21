// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

describe('App routing', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    window.history.pushState({}, '', '/teacher/dashboard');
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('renders the teacher dashboard route without crashing', () => {
    expect(() => {
      act(() => {
        root.render(
          <AuthProvider>
            <MemoryRouter initialEntries={['/teacher/dashboard']}>
              <App />
            </MemoryRouter>
          </AuthProvider>
        );
      });
    }).not.toThrow();

    expect(container.textContent).toContain('KV School');
  });
});
