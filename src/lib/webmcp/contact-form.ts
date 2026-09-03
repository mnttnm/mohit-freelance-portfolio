import type { PreparedInquiryState } from './session';

export interface ContactFormRoot {
  querySelector<T extends Element>(selector: string): T | null;
}

function contactFields(root: ContactFormRoot) {
  return {
    name: root.querySelector<HTMLInputElement>('#studio-name'),
    email: root.querySelector<HTMLInputElement>('#studio-email'),
    message: root.querySelector<HTMLTextAreaElement>('#studio-message'),
  };
}

function announceFieldChange(field: HTMLInputElement | HTMLTextAreaElement | null) {
  field?.dispatchEvent(new Event('input', { bubbles: true }));
  field?.dispatchEvent(new Event('change', { bubbles: true }));
}

export function applyPreparedInquiryToForm(
  state: PreparedInquiryState,
  root: ContactFormRoot = document,
) {
  const { name, email, message } = contactFields(root);
  if (!message || (state.name && !name) || (state.email && !email)) return false;

  if (name && state.name) name.value = state.name;
  if (email && state.email) email.value = state.email;
  message.value = state.contactMessage;
  for (const field of [name, email, message]) announceFieldChange(field);

  return (
    message.value === state.contactMessage &&
    (!state.name || name?.value === state.name) &&
    (!state.email || email?.value === state.email)
  );
}

export function clearPreparedInquiryForm(root: ContactFormRoot = document) {
  const fields = contactFields(root);
  for (const field of [fields.name, fields.email, fields.message]) {
    if (!field) continue;
    field.value = '';
    announceFieldChange(field);
  }
}
