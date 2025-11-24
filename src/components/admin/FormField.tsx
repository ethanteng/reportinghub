import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  description,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

interface FormFieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export function FormFieldInput({
  label,
  description,
  error,
  required,
  className,
  ...props
}: FormFieldInputProps) {
  return (
    <FormField label={label} description={description} error={error} required={required}>
      <Input className={className} {...props} />
    </FormField>
  );
}

interface FormFieldTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export function FormFieldTextarea({
  label,
  description,
  error,
  required,
  className,
  ...props
}: FormFieldTextareaProps) {
  return (
    <FormField label={label} description={description} error={error} required={required}>
      <Textarea className={className} {...props} />
    </FormField>
  );
}

