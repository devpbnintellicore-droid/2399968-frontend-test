// src/validations/experimentValidation.js
export const validateStep1 = (form, ingredients) => {
    const errors = {};

    if (!form.recipeName || !form.recipeName.trim()) {
        errors.recipeName = "Recipe name is required.";
    }

    if (!form.expDate) {
        errors.expDate = "Experiment date is required.";
    } else {
        const date = new Date(form.expDate);

        if (isNaN(date.getTime())) {
            errors.expDate = "Please enter a valid date.";
        } else {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (date > today) {
                errors.expDate = "Experiment date cannot be in the future.";
            }
        }
    }


    if (!form.expTime) {
        errors.expTime = "Experiment time is required.";
    } else if (form.expDate) {
        const selectedDate = new Date(form.expDate);
        if (!isNaN(selectedDate.getTime())) {
            const today = new Date();
            if (
                selectedDate.getFullYear() === today.getFullYear() &&
                selectedDate.getMonth() === today.getMonth() &&
                selectedDate.getDate() === today.getDate()
            ) {
                const [hours, minutes] = form.expTime.split(":").map(Number);
                const currentTime = today.getHours() * 60 + today.getMinutes();
                const selectedTime = (hours || 0) * 60 + (minutes || 0);

                if (selectedTime > currentTime) {
                    errors.expTime = "Experiment time cannot be in the future.";
                }
            }
        }
    }

    const validIngredients = (ingredients || []).filter(
        (ing) =>
            ing.name &&
            ing.name.trim() &&
            ing.quantity &&
            Number(ing.quantity) > 0
    );

    if (validIngredients.length === 0) {
        errors.ingredients =
            "At least one valid ingredient with name and quantity is required.";
    } else {
        const names = validIngredients.map(ing => ing.name.trim().toLowerCase());
        const hasDuplicates = names.some((name, index) => names.indexOf(name) !== index);
        if (hasDuplicates) {
            errors.ingredients = "Duplicate ingredients detected. Please ensure all names are unique.";
        }
    }

    return errors;
};

export const validateStep2 = (form) => {
    const errors = {};

    const temp = Number(form.temp);
    const duration = Number(form.timing);

    // Temperature
    if (!form.temp) {
        errors.temp = "Target temperature is required.";
    } else if (isNaN(temp)) {
        errors.temp = "Please enter a valid numeric temperature.";
    } else if (temp < 50) {
        errors.temp = "Temperature must be at least 50°C.";
    } else if (temp > 300) {
        errors.temp = "Temperature cannot exceed 300°C.";
    }

    // Duration
    if (!form.timing) {
        errors.timing = "Cooking duration is required.";
    } else if (isNaN(duration)) {
        errors.timing = "Please enter a valid duration.";
    } else if (!Number.isInteger(duration)) {
        errors.timing = "Duration must be a whole number.";
    } else if (duration < 1) {
        errors.timing = "Duration must be at least 1 minute.";
    } else if (duration > 480) {
        errors.timing = "Duration cannot exceed 480 minutes.";
    }

    return errors;
};

export const validateStep3 = (form) => {
    const errors = {};

    // For step 3, we might want to ensure at least some data is entered, 
    // though the current backend schema has them as optional.
    // However, it's good practice to have at least textures or outputs.

    if (form.expOutputValue) {
        const val = Number(form.expOutputValue);
        if (isNaN(val)) {
            errors.expOutputValue = "Expected output must be a number.";
        } else if (val <= 0) {
            errors.expOutputValue = "Expected output must be greater than zero.";
        }
    }

    if (form.actOutputValue) {
        const val = Number(form.actOutputValue);
        if (isNaN(val)) {
            errors.actOutputValue = "Actual output must be a number.";
        } else if (val <= 0) {
            errors.actOutputValue = "Actual output must be greater than zero.";
        }
    }

    return errors;
};

export const validateStep4 = (form) => {
    const errors = {};
    if (!form.images || form.images.length === 0) {
        errors.images = "At least one image is required.";
    } else if (form.images.length > 3) {
        errors.images = "Maximum 3 images allowed.";
    }
    return errors;
};