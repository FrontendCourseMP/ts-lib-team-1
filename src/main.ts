// Точка входа в ваше решение
import { createFormValidator } from './validators/FormValidator';

const form = document.querySelector('form');
if (form) {
    const validator = createFormValidator(form);
    const nameField = form.querySelector('input[type="text"]') as HTMLInputElement;
    const errorMessage = form.querySelector('p[role="alert"]') as HTMLParagraphElement;
    
    // Функция для отображения ошибок
    function displayErrors(fieldName: string) {
        // Получаем валидатор заново, чтобы пересчитать ошибки
        const fieldValidator = validator.field(fieldName);
        // Вызываем валидацию
        fieldValidator.string().required('Имя обязательно').minlength(2, 'Минимум 2 символа');
        
        // Получаем ошибки
        const errors = fieldValidator.getErrors?.() || [];
        if (errorMessage) {
            if (errors.length > 0) {
                errorMessage.textContent = errors.join(', ');
                errorMessage.style.color = 'red';
            } else {
                errorMessage.textContent = '';
            }
        }
    }
    
    // Валидация при вводе текста
    if (nameField) {
        nameField.addEventListener('input', () => {
            displayErrors('name');
        });
        
        nameField.addEventListener('blur', () => {
            displayErrors('name');
        });
    }
    
    // Проверка всей формы при отправке
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const isValid = validator.validate();
        
        if (nameField) {
            displayErrors('name');
        }
        
        if (isValid) {
            if (errorMessage) {
                errorMessage.textContent = 'Форма валидна!';
                errorMessage.style.color = 'green';
            }
            alert('Форма успешно отправлена!');
        } else {
            const allErrors = validator.getAllValidity();
            const allErrorMessages = allErrors
                .flatMap(v => v.errors)
                .filter(err => err.length > 0);
            
            if (errorMessage && allErrorMessages.length > 0) {
                errorMessage.textContent = allErrorMessages.join(', ');
                errorMessage.style.color = 'red';
            }
        }
    });
}
