import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the AMS heading', () => {
    render(<App />)
    expect(screen.getByText('AMS')).toBeInTheDocument()
  })
})
