import type { TFieldValidator } from '../types/types';
import { createStringFieldValidator } from './StringValidator';
import { createNumberFieldValidator } from './NumberValidator';
import { createArrayFieldValidator } from './ArrayValidator';

export function createFieldValidator(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): TFieldValidator {
    if (element instanceof HTMLInputElement && element.type === 'number') {
        return createNumberFieldValidator(element);
    }

    if (element instanceof HTMLInputElement && element.type === 'checkbox') {
        const form = element.form;
        if (form) {
            const group = form.querySelectorAll(`input[name="${element.name}"]`) as NodeListOf<HTMLInputElement>;
            return createArrayFieldValidator(group);
        }
    }

    return createStringFieldValidator(element as HTMLInputElement | HTMLTextAreaElement);
}

