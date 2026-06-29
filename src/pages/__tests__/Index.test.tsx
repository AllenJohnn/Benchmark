import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Index from '../Index';

const renderPage = () =>
  render(
    <MemoryRouter>
      <Index />
    </MemoryRouter>,
  );

describe('Index page (Minimalist Homepage)', () => {
  it('shows the logo heading and simple description', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: /quickbench/i })).toBeVisible();
    expect(
      screen.getByText(/minimalist typing and precision reflex benchmark/i),
    ).toBeVisible();
  });

  it('routes to the correct destinations', () => {
    renderPage();

    const aimLink = screen.getByRole('link', { name: /aim_trainer/i });
    expect(aimLink).toHaveAttribute('href', '/aim');

    const typingLink = screen.getByRole('link', { name: /typing_test/i });
    expect(typingLink).toHaveAttribute('href', '/typing');
  });
});
