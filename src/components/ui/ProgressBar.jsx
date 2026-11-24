import { AlertTriangle } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { cn } from '../../utils/format';
import { Button } from './Button';
import { Modal } from './Dialog';

/** Thin progress bar used for password strength and free-shipping thresholds. */
export function ProgressBar({ value, max = 100, tone = 'ink', className, showLabel = false }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  const tones = {
    ink: 'bg-ink dark:bg-cream',
    gold: 'bg-gold',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className="h-1 w-full overflow-hidden bg-ink-100 dark:bg-night-border"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full transition-all duration-500 ease-editorial', tones[tone] ?? tones.ink)}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && <p className="mt-2 text-xs text-muted">{Math.round(percent)}%</p>}
    </div>
  );
}

/** Confirmation dialog — used for destructive actions such as emptying the bag. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
}) {
  const { t } = useI18n();

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="subtle" size="sm" onClick={onClose}>
            {cancelLabel ?? t('common.cancel')}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
          >
            {confirmLabel ?? t('common.confirm')}
          </Button>
        </div>
      }
    >
      <div className="flex gap-4">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
            tone === 'danger' ? 'bg-danger/10 text-danger' : 'bg-gold/15 text-gold-700',
          )}
        >
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="pt-1.5 text-sm leading-relaxed text-muted">{description}</p>
      </div>
    </Modal>
  );
}

export default ProgressBar;
