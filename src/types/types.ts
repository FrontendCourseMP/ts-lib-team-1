// src/types/types.ts
export type TForm = HTMLFormElement;
export type TFormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type TElementAttributes = {
    element: TFormElement;
    name?: string;
    type?: string;
    value?: string | number | boolean;
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    customErrors?: Record<'required' | 'min' | 'max' | 'minLength' | 'maxLength', string>;
};

export type TElementsAttributes = TElementAttributes[];

export type TElementValidity = {
    element: TFormElement;
    validity: ValidityState;
    isValid: boolean;
    errors: string[];
    value: string | number | boolean | string[];
};

export type TFormValidationResult = {
    isValid: boolean;
    errors: Record<string, string[]>;
};

export type TStringValidator = {
    minlength: (length: number, message?: string) => TStringValidator & TFieldValidator;
    maxlength: (length: number, message?: string) => TStringValidator & TFieldValidator;
    required: (message?: string) => TStringValidator & TFieldValidator;
    email: (message?: string) => TStringValidator & TFieldValidator;
    url: (message?: string) => TStringValidator & TFieldValidator;
    custom?: (fn: (value: unknown) => boolean, message: string) => TStringValidator & TFieldValidator;
};

export type TNumberValidator = {
    min: (value: number, message?: string) => TNumberValidator & TFieldValidator;
    max: (value: number, message?: string) => TNumberValidator & TFieldValidator;
    required: (message?: string) => TNumberValidator & TFieldValidator;
    integer: (message?: string) => TNumberValidator & TFieldValidator;
    positive: (message?: string) => TNumberValidator & TFieldValidator;
    custom?: (fn: (value: unknown) => boolean, message: string) => TNumberValidator & TFieldValidator;
};

export type TFieldValidator = {
    element: TFormElement;
    string: () => TStringValidator & TFieldValidator;
    number: () => TNumberValidator & TFieldValidator;
    required: (message?: string) => TFieldValidator;
    custom: (validatorFn: (value: unknown) => boolean, message: string) => TFieldValidator;
    getErrors?: () => string[];
};

export type TFormValidator = {
    form: TForm;
    elements: TElementsAttributes;
    field: (name: string) => TFieldValidator;
    validate: () => boolean;
    validateField: (name: string) => TElementValidity | null;
    getAllValidity: () => TElementValidity[];
};

export type TCreateFormValidator = (form: TForm) => TFormValidator;
