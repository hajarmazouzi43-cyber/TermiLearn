import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AICopilot from '../../components/AICopilot'

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn()

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => 'Use `ls -la` to list all files including hidden ones.'
        }
      })
    })
  }))
}))

describe('AICopilot Component', () => {
  const mockOnClose = vi.fn()
  const currentCwd = '/home/user'

  beforeEach(() => {
    vi.clearAllMocks()
  })

 it('affiche le message de bienvenue au démarrage', () => {
  render(<AICopilot onClose={mockOnClose} currentCwd={currentCwd} />)
  expect(screen.getAllByText(/LinuxBot/i).length).toBeGreaterThanOrEqual(1)
  expect(screen.getByText(/your Linux learning assistant/i)).toBeInTheDocument()
})

  it('affiche le bouton de fermeture', () => {
    render(<AICopilot onClose={mockOnClose} currentCwd={currentCwd} />)
    expect(screen.getByText('✕')).toBeInTheDocument()
  })

  it('appelle onClose quand on clique sur la croix', () => {
    render(<AICopilot onClose={mockOnClose} currentCwd={currentCwd} />)
    fireEvent.click(screen.getByText('✕'))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('affiche les suggestions au démarrage', () => {
    render(<AICopilot onClose={mockOnClose} currentCwd={currentCwd} />)
    expect(screen.getByText('How do I list all files?')).toBeInTheDocument()
    expect(screen.getByText('What does rm -r do?')).toBeInTheDocument()
  })

  it('affiche le champ de saisie', () => {
    render(<AICopilot onClose={mockOnClose} currentCwd={currentCwd} />)
    expect(screen.getByPlaceholderText(/Ask about any Linux command/i)).toBeInTheDocument()
  })

  it('le bouton envoi est désactivé si input vide', () => {
    render(<AICopilot onClose={mockOnClose} currentCwd={currentCwd} />)
    const btn = screen.getByText('➤')
    expect(btn).toBeDisabled()
  })

  it('le bouton envoi est activé si input non vide', () => {
    render(<AICopilot onClose={mockOnClose} currentCwd={currentCwd} />)
    const input = screen.getByPlaceholderText(/Ask about any Linux command/i)
    fireEvent.change(input, { target: { value: 'How to use ls?' } })
    const btn = screen.getByText('➤')
    expect(btn).not.toBeDisabled()
  })

it('envoie un message et affiche la réponse IA', async () => {
  render(<AICopilot onClose={mockOnClose} currentCwd={currentCwd} />)
  const input = screen.getByPlaceholderText(/Ask about any Linux command/i)
  fireEvent.change(input, { target: { value: 'How to list files?' } })
  fireEvent.click(screen.getByText('➤'))

  // Vérifie que le message user est affiché
  expect(screen.getByText('How to list files?')).toBeInTheDocument()

  // Attend que le loading disparaisse et réponse arrive
  await waitFor(() => {
    const messages = document.querySelectorAll('[style*="background-color: rgb(248, 250, 252)"]')
    expect(messages.length).toBeGreaterThan(1)
  }, { timeout: 5000 })
})

it('envoie un message avec la touche Enter', async () => {
  render(<AICopilot onClose={mockOnClose} currentCwd={currentCwd} />)
  const input = screen.getByPlaceholderText(/Ask about any Linux command/i)
  fireEvent.change(input, { target: { value: 'What is pwd?' } })
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

  expect(screen.getByText('What is pwd?')).toBeInTheDocument()

  await waitFor(() => {
    const messages = document.querySelectorAll('[style*="background-color: rgb(248, 250, 252)"]')
    expect(messages.length).toBeGreaterThan(1)
  }, { timeout: 5000 })
})

it('envoie une suggestion quand on clique dessus', async () => {
  render(<AICopilot onClose={mockOnClose} currentCwd={currentCwd} />)
  fireEvent.click(screen.getByText('How do I list all files?'))

  await waitFor(() => {
    expect(screen.getByText('How do I list all files?')).toBeInTheDocument()
  })

  await waitFor(() => {
    const messages = document.querySelectorAll('[style*="background-color: rgb(248, 250, 252)"]')
    expect(messages.length).toBeGreaterThan(1)
  }, { timeout: 5000 })
})
  it('affiche le statut Online', () => {
    render(<AICopilot onClose={mockOnClose} currentCwd={currentCwd} />)
    expect(screen.getByText('● Online')).toBeInTheDocument()
  })
})