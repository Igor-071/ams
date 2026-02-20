import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '../confirm-dialog.tsx'

// AC-018: ConfirmDialog renders and handles actions
describe('ConfirmDialog', () => {
  it('renders title and description when open', () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Delete item?"
        description="This action cannot be undone."
        onConfirm={() => {}}
      />,
    )
    expect(screen.getByText('Delete item?')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Confirm"
        description="Are you sure?"
        onConfirm={onConfirm}
        confirmLabel="Yes, delete"
      />,
    )
    await userEvent.click(screen.getByText('Yes, delete'))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onOpenChange when cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Confirm"
        description="Are you sure?"
        onConfirm={() => {}}
        cancelLabel="No, keep it"
      />,
    )
    await userEvent.click(screen.getByText('No, keep it'))
    expect(onOpenChange).toHaveBeenCalled()
  })

  it('does not render when closed', () => {
    render(
      <ConfirmDialog
        open={false}
        onOpenChange={() => {}}
        title="Hidden"
        description="Should not appear"
        onConfirm={() => {}}
      />,
    )
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })
})
