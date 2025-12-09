import type { TFieldValidator, TStringValidator, TNumberValidator } from '../types/types';

export function createArrayFieldValidator(fields: NodeListOf<HTMLInputElement>): TFieldValidator {
    let errors: string[] = [];
    const firstElement = fields[0] || null;

    const validator: TFieldValidator = {
        element: firstElement as HTMLInputElement,
        string() {
            errors = []; // Очищаем ошибки при начале новой цепочки валидации
            return this as unknown as TStringValidator & TFieldValidator;
        },
        number() {
            errors = []; // Очищаем ошибки при начале новой цепочки валидации
            return this as unknown as TNumberValidator & TFieldValidator;
        },
        required(message?: string) {
            const checkedValues = Array.from(fields).filter(f => f.checked);
            if (checkedValues.length === 0) {
                errors.push(message || 'Необходимо выбрать хотя бы один вариант');
            }
            return this;
        },
        custom(validatorFn: (value: unknown) => boolean, message: string) {
            const values = Array.from(fields)
                .filter(f => f.checked)
                .map(f => f.value);
            if (!validatorFn(values)) {
                errors.push(message);
            }
            return this;
        },
        getErrors() {
            return [...errors];
        }
    };

    return validator;
}

