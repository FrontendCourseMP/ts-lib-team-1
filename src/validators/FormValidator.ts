import type { TFormValidator, TFieldValidator, TElementsAttributes, TElementValidity } from '../types/types';
import { createStringFieldValidator } from './StringValidator';
import { createNumberFieldValidator } from './NumberValidator';
import { createArrayFieldValidator } from './ArrayValidator';

export function createFormValidator(form: HTMLFormElement): TFormValidator {
    const elements: TElementsAttributes = Array.from(form.elements).map(el => ({
        element: el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
        name: (el as HTMLInputElement).name,
        type: (el as HTMLInputElement).type,
        required: (el as HTMLInputElement).required,
    }));

    const fields: Record<string, TFieldValidator> = {};

    function makeField(name: string): TFieldValidator {
        if (fields[name]) return fields[name];

        const el = form.elements.namedItem(name);
        if (!el) throw new Error(`Поле ${name} не найдено`);

        if (el instanceof RadioNodeList) {
            const first = el[0] as HTMLInputElement | undefined;
            if (first?.type === 'checkbox') {
                const group = form.querySelectorAll(`input[name="${name}"]`) as NodeListOf<HTMLInputElement>;
                fields[name] = createArrayFieldValidator(group);
                return fields[name];
            }
        }

        if (el instanceof HTMLInputElement && el.type === 'number') {
            fields[name] = createNumberFieldValidator(el);
            return fields[name];
        }

        if (el instanceof HTMLInputElement && el.type === 'checkbox') {
            const group = form.querySelectorAll(`input[name="${name}"]`) as NodeListOf<HTMLInputElement>;
            fields[name] = createArrayFieldValidator(group);
            return fields[name];
        }

        fields[name] = createStringFieldValidator(el as HTMLInputElement | HTMLTextAreaElement);
        return fields[name];
    }

    function validate(): boolean {
        let ok = true;
        for (const name in fields) {
            const fv = fields[name];
            const errs = typeof fv.getErrors === 'function' ? fv.getErrors() : [];
            if (errs.length) ok = false;
        }
        return ok;
    }

    function validateField(name: string): TElementValidity | null {
        const fv = fields[name];
        if (!fv) return null;
        const errs = typeof fv.getErrors === 'function' ? fv.getErrors() : [];
        return {
            element: fv.element,
            validity: fv.element.validity,
            isValid: errs.length === 0,
            errors: errs,
            value: (fv.element as HTMLInputElement).value,
        };
    }

    function getAllValidity(): TElementValidity[] {
        return Object.keys(fields)
            .map(name => validateField(name))
            .filter((validity): validity is TElementValidity => validity !== null);
    }

    return {
        form,
        elements,
        field(name: string) {
            return makeField(name);
        },
        validate,
        validateField,
        getAllValidity,
    };
}
