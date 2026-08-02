const phoneNumberInput = document.getElementById('phone-number');
const phoneError = document.getElementById('phone-error');

if (phoneNumberInput && phoneError) {
  const validatePhoneNumber = () => {
    const sanitizedValue = phoneNumberInput.value.replace(/\s+/g, '');
    const isValid = sanitizedValue === '' || /^\d+$/.test(sanitizedValue);

    phoneNumberInput.setAttribute('aria-invalid', String(!isValid));
    phoneError.classList.toggle('hidden', isValid);
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
}
