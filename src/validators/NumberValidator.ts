import type { TFieldValidator, TNumberValidator } from '../types/types';
import { createStringFieldValidator } from './StringValidator';

export function createNumberFieldValidator(field: HTMLInputElement): TFieldValidator & TNumberValidator {
    const errors: string[] = [];

    const validator: TFieldValidator & TNumberValidator = {
        element: field,
        string() {
            return createStringFieldValidator(this.element as HTMLInputElement | HTMLTextAreaElement);
        },
        number() {
            return this;
        },
        required(message?: string) {
            if (field.value === '') errors.push(message || 'Поле обязательно');
            return this;
        },
        min(value: number, message?: string) {
            const num = Number(field.value);
            if (!isNaN(num) && num < value) errors.push(message || `Минимум ${value}`);
            return this;
        },
        max(value: number, message?: string) {
            const num = Number(field.value);
            if (!isNaN(num) && num > value) errors.push(message || `Максимум ${value}`);
            return this;
        },
        integer(message?: string) {
            const num = Number(field.value);
            if (!Number.isInteger(num)) errors.push(message || 'Должно быть целым числом');
            return this;
        },
        positive(message?: string) {
            const num = Number(field.value);
            if (num <= 0) errors.push(message || 'Должно быть положительным числом');
            return this;
        },
        custom(fn: (value: unknown) => boolean, message: string) {
            if (!fn(Number(field.value))) errors.push(message);
            return this;
        },
        getErrors() {
            return [...errors];
        }
    };

    return validator;
}
