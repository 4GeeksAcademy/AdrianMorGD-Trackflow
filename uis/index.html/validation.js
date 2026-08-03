const phoneNumberInput = document.getElementById('phone-number');
const phoneError = document.getElementById('phone-error');
const quoteForm = document.getElementById('quote-form');
const submitToast = document.getElementById('submit-toast');
const emailInput = quoteForm?.querySelector('input[name="email"]');
const emailError = document.getElementById('email-error');

let toastTimeoutId;

const showSubmitToast = () => {
  if (!submitToast) {
    return;
  }

  submitToast.classList.remove('opacity-0', 'translate-y-4');
  submitToast.classList.add('opacity-100', 'translate-y-0');

  window.clearTimeout(toastTimeoutId);
  toastTimeoutId = window.setTimeout(() => {
    submitToast.classList.add('opacity-0', 'translate-y-4');
    submitToast.classList.remove('opacity-100', 'translate-y-0');
  }, 2800);
};

const validateEmail = (requireValue = false) => {
  if (!emailInput || !emailError) {
    return !requireValue;
  }

  const normalizedEmail = emailInput.value.trim();
  const hasValue = normalizedEmail.length > 0;
  const hasValidFormat = emailInput.checkValidity();
  const isValid = requireValue ? hasValue && hasValidFormat : !hasValue || hasValidFormat;

  emailInput.setAttribute('aria-invalid', String(!isValid));
  emailError.classList.toggle('hidden', isValid);

  return isValid;
};

if (emailInput && emailError) {
  emailInput.addEventListener('input', () => {
    validateEmail(false);
  });

  emailInput.addEventListener('blur', () => {
    validateEmail(true);
  });
}

if (phoneNumberInput && phoneError) {
  const validatePhoneNumber = (requireValue = false) => {
    const sanitizedValue = phoneNumberInput.value.replace(/\s+/g, '');
    const hasValue = sanitizedValue.length > 0;
    const containsOnlyDigits = /^\d+$/.test(sanitizedValue);
    const isValid = requireValue ? hasValue && containsOnlyDigits : !hasValue || containsOnlyDigits;

    phoneNumberInput.setAttribute('aria-invalid', String(!isValid));
    phoneError.classList.toggle('hidden', isValid);

    return isValid;
  };

  phoneNumberInput.addEventListener('input', () => {
    const filteredValue = phoneNumberInput.value.replace(/[^\d]/g, '');
    const hadInvalidCharacters = filteredValue !== phoneNumberInput.value;

    phoneNumberInput.value = filteredValue;
    phoneNumberInput.setAttribute('aria-invalid', String(hadInvalidCharacters));
    phoneError.classList.toggle('hidden', !hadInvalidCharacters && filteredValue !== '');

    if (!hadInvalidCharacters) {
      validatePhoneNumber();
    }
  });

  phoneNumberInput.addEventListener('blur', validatePhoneNumber);

  if (quoteForm) {
    quoteForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const emailIsValid = validateEmail(true);
      const phoneIsValid = validatePhoneNumber(true);
      const canShowToast = emailIsValid && phoneIsValid;

      if (!canShowToast) {
        return;
      }

      showSubmitToast();
    });
  }
}
