
// тип для самой формы
export type TForm = HTMLFormElement;
// тип для элемента формы(только те которые валидируем)
export type TFormElement =  | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

// тип для массива атрибутов элемента формы
export type TElementAttributes = {
        element: TFormElement;
        name?: string;
        type?: string;
        value?: unknown;
        required?: boolean;
        min?: number;
        max?: number;
        minLength?: number;
        maxLength?: number;
}

// тип для массива атрибутов для каждого из элементов формы
export type TElementsAttributes = TElementAttributes[];

