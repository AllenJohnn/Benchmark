import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Index from '../Index';

const renderPage = () =>
  render(
    <MemoryRouter>
      <Index />
    </MemoryRouter>,
  );

describe('Index page', () => {
  it('shows the hero heading and subtitle', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: /quickbench/i })).toBeVisible();
    expect(
      screen.getByText(/test your reflexes and typing speed/i),
    ).toBeVisible();
  });

  it('lists both benchmark cards with their stat tags', () => {
    renderPage();

    const aimCard = screen.getByRole('link', { name: /aim trainer/i });
    const aimStats = within(aimCard).getAllByText(/time|accuracy|cps/i, {
      selector: 'span',
    });
    expect(aimStats).toHaveLength(3);

    const typingCard = screen.getByRole('link', { name: /typing test/i });
    const typingStats = within(typingCard).getAllByText(/wpm|accuracy|characters/i, {
      selector: 'span',
    });
    expect(typingStats).toHaveLength(3);
  });

  it('routes to the correct destinations', () => {
    renderPage();

    expect(screen.getByRole('link', { name: /aim trainer/i })).toHaveAttribute(
      'href',
      '/aim',
    );
    expect(screen.getByRole('link', { name: /typing test/i })).toHaveAttribute(
      'href',
      '/typing',
    );
  });
});
