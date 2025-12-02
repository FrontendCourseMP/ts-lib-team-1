
export type TForm = HTMLFormElement;
export type TFormElement =  | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

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

export type TElementsAttributes = TElementAttributes[];

export type TElementValidity = {
        element: TFormElement;
        validity: ValidityState;
        isValid: boolean;
        errors: string[];
        value: unknown;
};

export type TFormValidationResult = {
  isValid: boolean;
  errors: Record<string, string[]>;
}


export type TFormValidator = {
        form: TForm;
        elements: TElementsAttributes;
        validate: () => boolean;
        validateField: (name: string) => TElementValidity | null;
        getAllValidity: () => TElementValidity[];
};

export type TCreateFormValidator = (form: TForm) => TFormValidator;

