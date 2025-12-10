import { beforeEach, describe, expect, it } from 'vitest';
import { createFormValidator } from '../validators/FormValidator';
import type { TFieldValidator } from '../types/types';

type TControls = {
    name: HTMLInputElement;
    email: HTMLInputElement;
    age: HTMLInputElement;
    about: HTMLTextAreaElement;
    interestMusic: HTMLInputElement;
    interestArt: HTMLInputElement;
};

function createFormWithControls() {
    const form = document.createElement('form');

    const name = document.createElement('input');
    name.name = 'name';
    name.type = 'text';
    name.required = true;

    const email = document.createElement('input');
    email.name = 'email';
    email.type = 'text';

    const age = document.createElement('input');
    age.name = 'age';
    age.type = 'number';
    age.required = true;

    const about = document.createElement('textarea');
    about.name = 'about';

    const interestMusic = document.createElement('input');
    interestMusic.type = 'checkbox';
    interestMusic.name = 'interests';
    interestMusic.value = 'music';

    const interestArt = document.createElement('input');
    interestArt.type = 'checkbox';
    interestArt.name = 'interests';
    interestArt.value = 'art';

    form.append(name, email, age, about, interestMusic, interestArt);

    const controls: TControls = { name, email, age, about, interestMusic, interestArt };
    return { form, controls };
}

describe('createFormValidator — проверки формы', () => {
    let form: HTMLFormElement;
    let controls: TControls;
    let validator: ReturnType<typeof createFormValidator>;
    const errorsOf = (fv: TFieldValidator) => fv.getErrors?.() ?? [];

    beforeEach(() => {
        const setup = createFormWithControls();
        form = setup.form;
        controls = setup.controls;
        validator = createFormValidator(form);
    });

    it('валидирует текстовые поля и очищает ошибки при новой цепочке', () => {
        // Arrange
        const nameField = validator.field('name');
        controls.name.value = '';
        // Act
        nameField.string().required('Имя обязательно').minlength(3, 'Короткое имя');
        // Assert
        expect(errorsOf(nameField)).toEqual(['Имя обязательно', 'Короткое имя']);

        // Arrange
        controls.name.value = 'Alice';
        // Act
        nameField.string().required().minlength(3);
        // Assert
        expect(errorsOf(nameField)).toEqual([]);

        // Arrange
        const emailField = validator.field('email');
        controls.email.value = 'invalid-email';
        // Act
        emailField.string().email('Неверный email');
        // Assert
        expect(errorsOf(emailField)).toEqual(['Неверный email']);

        // Arrange
        controls.email.value = 'user@example.com';
        // Act
        emailField.string().email();
        // Assert
        expect(errorsOf(emailField)).toEqual([]);
    });

    it('валидирует числовые поля: required/min/max/integer/positive', () => {
        // Arrange
        const ageField = validator.field('age');

        // Act
        controls.age.value = '';
        ageField.number().required('Возраст обязателен').min(18, 'Слишком молодой');
        // Assert
        expect(errorsOf(ageField)).toEqual(['Возраст обязателен', 'Слишком молодой']);

        // Act
        controls.age.value = '17';
        ageField.number().required().min(18, 'Слишком молодой').integer().positive();
        // Assert
        expect(errorsOf(ageField)).toEqual(['Слишком молодой']);

        // Act
        controls.age.value = '20';
        ageField.number().required().min(18).max(30).integer().positive();
        // Assert
        expect(errorsOf(ageField)).toEqual([]);
    });

    it('валидирует группы чекбоксов как массив значений', () => {
        // Arrange
        const interestsField = validator.field('interests');

        // Act
        controls.interestMusic.checked = false;
        controls.interestArt.checked = false;
        interestsField.string().required('Выберите интерес');
        // Assert
        expect(errorsOf(interestsField)).toEqual(['Выберите интерес']);

        // Act
        controls.interestArt.checked = true;
        interestsField.string().required();
        // Assert
        expect(errorsOf(interestsField)).toEqual([]);
    });

    it('возвращает валидность формы целиком и по каждому полю', () => {
        // Arrange
        const nameField = validator.field('name');
        const ageField = validator.field('age');
        const interestsField = validator.field('interests');

        // Act
        controls.name.value = '';
        controls.age.value = '15';
        controls.interestArt.checked = false;
        controls.interestMusic.checked = false;

        nameField.string().required('Имя обязательно');
        ageField.number().required('Возраст обязателен').min(18, 'Мало лет');
        interestsField.string().required('Интерес обязателен');

        // Assert
        expect(validator.validate()).toBe(false);
        const ageValidity = validator.validateField('age');
        expect(ageValidity?.errors).toContain('Мало лет');
        expect(ageValidity?.isValid).toBe(false);

        // Arrange
        controls.name.value = 'Bob';
        controls.age.value = '22';
        controls.interestMusic.checked = true;

        nameField.string().required().minlength(2);
        ageField.number().required().min(18).positive();
        interestsField.string().required();

        // Assert
        expect(validator.validate()).toBe(true);
        const allValidity = validator.getAllValidity();
        expect(allValidity.every(v => v?.isValid)).toBe(true);
    });

    it('обрабатывает необязательные поля и кастомные текстовые проверки', () => {
        // Arrange
        const emailField = validator.field('email');
        const aboutField = validator.field('about');

        // Act (опциональный email: пустое значение допустимо)
        controls.email.value = '';
        emailField.string().email();
        expect(errorsOf(emailField)).toEqual([]);

        // Act (проверка URL должна упасть на неверном значении)
        controls.about.value = 'not-a-url';
        aboutField.string().url('URL неверен');
        expect(errorsOf(aboutField)).toEqual(['URL неверен']);

        // Act (кастомная проверка строки)
        controls.about.value = 'short';
        aboutField.string().custom(v => (v as string).length > 5, 'Слишком коротко');
        expect(errorsOf(aboutField)).toEqual(['Слишком коротко']);

        // Act
        controls.about.value = 'достаточно длинное описание';
        aboutField.string().custom(v => (v as string).length > 5, 'Слишком коротко');
        expect(errorsOf(aboutField)).toEqual([]);
    });

    it('добавляет ошибки для правил integer/positive/custom чисел', () => {
        // Arrange
        const ageField = validator.field('age');

        // Act
        controls.age.value = '20.5';
        ageField.number().integer('Только целые');
        expect(errorsOf(ageField)).toEqual(['Только целые']);

        // Act
        controls.age.value = '0';
        ageField.number().positive('Только положительные');
        expect(errorsOf(ageField)).toEqual(['Только положительные']);

        // Act
        controls.age.value = '15';
        ageField.number().custom(v => Number(v) >= 18, 'Недостаточно лет');
        expect(errorsOf(ageField)).toEqual(['Недостаточно лет']);

        // Act
        controls.age.value = '21';
        ageField.number().integer().positive().custom(v => Number(v) >= 18, 'Недостаточно лет');
        expect(errorsOf(ageField)).toEqual([]);
    });

    it('поддерживает кастомную проверку группы чекбоксов', () => {
        // Arrange
        const interestsField = validator.field('interests');

        // Act
        controls.interestArt.checked = true;
        controls.interestMusic.checked = false;
        interestsField.string().custom(values => (values as string[]).length >= 2, 'Выберите 2 варианта');
        expect(errorsOf(interestsField)).toEqual(['Выберите 2 варианта']);

        // Act
        controls.interestMusic.checked = true;
        interestsField.string().custom(values => (values as string[]).length >= 2, 'Выберите 2 варианта');
        expect(errorsOf(interestsField)).toEqual([]);
    });

    it('validateField отдаёт null для неизвестного поля, getAllValidity пропускает его', () => {
        // Arrange & Assert (unknown)
        expect(validator.validateField('unknown')).toBeNull();

        // Arrange
        validator.field('name');
        validator.field('email');
        const validity = validator.getAllValidity();
        const names = validity.map(v => v.element.name);
        // Assert
        expect(names).toContain('name');
        expect(names).toContain('email');
        expect(names).not.toContain('unknown');
    });

    it('happy path: все поля валидны и validate возвращает true', () => {
        // Arrange
        const nameField = validator.field('name');
        const emailField = validator.field('email');
        const ageField = validator.field('age');
        const interestsField = validator.field('interests');

        controls.name.value = 'Charlie';
        controls.email.value = 'charlie@test.io';
        controls.age.value = '25';
        controls.interestMusic.checked = true;

        // Act
        nameField.string().required().minlength(2);
        emailField.string().email();
        ageField.number().required().positive().integer().min(18).max(30);
        interestsField.string().required();

        // Assert
        expect(validator.validate()).toBe(true);
        const allValidity = validator.getAllValidity();
        expect(allValidity.every(v => v.isValid)).toBe(true);
    });

    it('злые тесты: каждое поле валится по своему правилу', () => {
        // Arrange
        const nameField = validator.field('name');
        const emailField = validator.field('email');
        const ageField = validator.field('age');
        const interestsField = validator.field('interests');

        controls.name.value = ' ';
        controls.email.value = 'broken';
        controls.age.value = '-1';
        controls.interestMusic.checked = false;
        controls.interestArt.checked = false;

        // Act
        nameField.string().required('Имя нужно');
        emailField.string().email('Плохой email');
        ageField.number().required('Возраст нужен').positive('Должен быть >0').integer('Целое').min(10, 'Мало');
        interestsField.string().required('Нет интересов');

        // Assert
        expect(validator.validate()).toBe(false);
        expect(errorsOf(nameField)).toContain('Имя нужно');
        expect(errorsOf(emailField)).toContain('Плохой email');
        expect(errorsOf(ageField)).toEqual(['Должен быть >0', 'Мало']);
        expect(errorsOf(interestsField)).toContain('Нет интересов');
    });
});

