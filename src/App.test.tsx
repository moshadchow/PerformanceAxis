import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from './App'

it('renders the PerformanceAxis application shell', () => {
  render(<App />)

  expect(screen.getByText('PerformanceAxis')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'XFL broker performance analytics' })).toBeInTheDocument()
})
