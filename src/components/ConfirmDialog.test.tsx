import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog';

afterEach(cleanup);

const renderDialog = (open: boolean) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmDialog
      open={open}
      title="Cancel this booking?"
      message="Its spots will be released."
      confirmLabel="Cancel booking"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { onConfirm, onCancel };
};

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    renderDialog(false);

    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('shows the title, message and both choices when open', () => {
    renderDialog(true);

    expect(
      screen.getByRole('alertdialog', { name: 'Cancel this booking?' }),
    ).toBeTruthy();
    expect(screen.getByText('Its spots will be released.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Keep booking' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancel booking' })).toBeTruthy();
  });

  it('focuses the keep button so Enter does not cancel by accident', () => {
    renderDialog(true);

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Keep booking' }),
    );
  });

  it('calls onConfirm when the confirm button is clicked', () => {
    const { onConfirm, onCancel } = renderDialog(true);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel booking' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel on Escape, the keep button, or a click outside', () => {
    const { onConfirm, onCancel } = renderDialog(true);

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Keep booking' }));
    fireEvent.click(screen.getByRole('alertdialog').parentElement!);

    expect(onCancel).toHaveBeenCalledTimes(3);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
