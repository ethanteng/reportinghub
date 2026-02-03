// Wizard state management using localStorage
// Tracks dismissal and completion state for the Developer Settings setup wizard

const WIZARD_STORAGE_KEY = 'dev-settings-wizard-dismissed';
const WIZARD_COMPLETED_KEY = 'dev-settings-wizard-completed';
const WIZARD_LAST_STEP_KEY = 'dev-settings-wizard-last-step';

export type WizardStep = 0 | 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'C';

/**
 * Check if the wizard has been dismissed
 */
export function isWizardDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(WIZARD_STORAGE_KEY) === 'true';
}

/**
 * Dismiss the wizard (hide banner)
 */
export function dismissWizard(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WIZARD_STORAGE_KEY, 'true');
}

/**
 * Check if the wizard has been completed
 */
export function isWizardCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(WIZARD_COMPLETED_KEY) === 'true';
}

/**
 * Mark the wizard as completed
 */
export function markWizardCompleted(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WIZARD_COMPLETED_KEY, 'true');
}

/**
 * Reset wizard state (for testing or re-launching)
 */
export function resetWizardState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(WIZARD_STORAGE_KEY);
  localStorage.removeItem(WIZARD_COMPLETED_KEY);
  localStorage.removeItem(WIZARD_LAST_STEP_KEY);
}

/**
 * Save the last visited step (for resume functionality)
 */
export function saveLastStep(step: WizardStep): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WIZARD_LAST_STEP_KEY, String(step));
}

/**
 * Get the last visited step
 */
export function getLastStep(): WizardStep | null {
  if (typeof window === 'undefined') return null;
  const step = localStorage.getItem(WIZARD_LAST_STEP_KEY);
  if (!step) return null;
  
  // Validate step value
  if (step === '0' || step === 'A1' || step === 'A2' || step === 'A3' || step === 'B1' || step === 'B2' || step === 'C') {
    return step === '0' ? 0 : step;
  }
  return null;
}

/**
 * Check if wizard should be shown (not dismissed and not completed)
 */
export function shouldShowWizard(): boolean {
  return !isWizardDismissed() && !isWizardCompleted();
}
