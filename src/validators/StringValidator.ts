import type { TFieldValidator, TStringValidator } from '../types/types';
import { createNumberFieldValidator } from './NumberValidator';

export function createStringFieldValidator(field: HTMLInputElement | HTMLTextAreaElement): TFieldValidator & TStringValidator {
    let errors: string[] = [];
    const validator: TFieldValidator & TStringValidator = {
        element: field,
        string() { 
            errors = []; // Очищаем ошибки при начале новой цепочки валидации
            return this; 
        },
        number() { return createNumberFieldValidator(this.element as HTMLInputElement);},
        required(message?: string) {
            if (!field.value.trim()) errors.push(message || 'Поле обязательно');
            return this;
        },
        minlength(value: number | string, message?: string) {
            if (field.value.length < Number(value)) errors.push(message || `Минимум ${value} символов`);
            return this;
        },
        maxlength(value: number | string, message?: string) {
            if (field.value.length > Number(value)) errors.push(message || `Максимум ${value} символов`);
            return this;
        },
        custom(fn: (value: unknown) => boolean, message: string) {
            if (!fn(field.value)) errors.push(message);
            return this;
        },
        email(message?: string) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (field.value && !regex.test(field.value)) errors.push(message || 'Неверный email');
            return this;
        },
        url(message?: string) {
            try {
                if (field.value) new URL(field.value);
            } catch {
                if (field.value) errors.push(message || 'Неверный URL');
            }
            return this;
        },
        getErrors() {
            return [...errors];
        }
    };
    return validator;
}
