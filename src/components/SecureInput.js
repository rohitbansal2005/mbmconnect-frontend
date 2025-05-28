import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { toast } from 'react-toastify';

const SecureInput = ({
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    required = false,
    minLength,
    maxLength,
    pattern,
    errorMessage,
    className = '',
    ...props
}) => {
    const [error, setError] = useState('');
    const [isDirty, setIsDirty] = useState(false);

    const validateInput = (input) => {
        // Sanitize input
        const sanitizedInput = DOMPurify.sanitize(input);

        // Check required
        if (required && !sanitizedInput) {
            return 'This field is required';
        }

        // Check min length
        if (minLength && sanitizedInput.length < minLength) {
            return `Minimum length is ${minLength} characters`;
        }

        // Check max length
        if (maxLength && sanitizedInput.length > maxLength) {
            return `Maximum length is ${maxLength} characters`;
        }

        // Check pattern
        if (pattern && !new RegExp(pattern).test(sanitizedInput)) {
            return errorMessage || 'Invalid input format';
        }

        return '';
    };

    const handleChange = (e) => {
        const input = e.target.value;
        const sanitizedInput = DOMPurify.sanitize(input);
        
        // Validate input
        const validationError = validateInput(sanitizedInput);
        setError(validationError);

        // Only update if validation passes or field is not required
        if (!validationError || !required) {
            onChange({
                target: {
                    name,
                    value: sanitizedInput
                }
            });
        } else {
            toast.error(validationError);
        }
    };

    const handleBlur = () => {
        setIsDirty(true);
        const validationError = validateInput(value);
        setError(validationError);
    };

    return (
        <div className={`secure-input ${className}`}>
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                required={required}
                minLength={minLength}
                maxLength={maxLength}
                pattern={pattern}
                className={`form-control ${error && isDirty ? 'is-invalid' : ''}`}
                {...props}
            />
            {error && isDirty && (
                <div className="invalid-feedback">
                    {error}
                </div>
            )}
        </div>
    );
};

export default SecureInput; 