const quoteForm = document.getElementById('quote-form');

if (!quoteForm) {
  console.warn('Quote form not found');
} else {
  const stepContainers = Array.from(document.querySelectorAll('[data-form-step]'));
  const stepIndicators = Array.from(document.querySelectorAll('[data-step-indicator]'));
  const stepperContainer = document.querySelector('[aria-label="Form steps"]');
  const stepDescription = document.getElementById('step-description');
  const backButton = document.getElementById('step-back');
  const nextButton = document.getElementById('step-next');
  const successMessage = document.getElementById('success-message');
  let currentStep = 1;

  const STEP_TEXTS = {
    1: 'Please enter contact ionformation',
    2: 'Please enter your company information',
    3: 'Please enter your service of interest information',
  };

  const fields = {
    companyName: document.getElementById('company-name'),
    contactPerson: document.getElementById('contact-person'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    website: document.getElementById('website'),
    country: document.getElementById('country'),
    productType: document.getElementById('product-type'),
    monthlyVolume: document.getElementById('monthly-volume'),
    comments: document.getElementById('comments'),
    privacyPolicy: document.getElementById('privacy-policy'),
  };

  const servicesCheckboxes = Array.from(document.querySelectorAll('input[name="services"]'));
  const current3plRadios = Array.from(document.querySelectorAll('input[name="current-3pl"]'));

  const errors = {
    companyName: document.getElementById('company-name-error'),
    contactPerson: document.getElementById('contact-person-error'),
    email: document.getElementById('email-error'),
    phone: document.getElementById('phone-error'),
    website: document.getElementById('website-error'),
    country: document.getElementById('country-error'),
    productType: document.getElementById('product-type-error'),
    monthlyVolume: document.getElementById('monthly-volume-error'),
    services: document.getElementById('services-error'),
    current3pl: document.getElementById('current-3pl-error'),
    comments: document.getElementById('comments-error'),
    privacyPolicy: document.getElementById('privacy-policy-error'),
  };

  const commentsCounter = document.getElementById('comments-counter');
  const lowVolumeWarning = document.getElementById('low-volume-warning');

  const MAX_COMMENTS = 500;

  const toggleError = (errorNode, isValid, message) => {
    if (!errorNode) {
      return;
    }

    if (message) {
      errorNode.textContent = message;
    }

    errorNode.classList.toggle('hidden', isValid);
  };

  const setAriaInvalid = (inputNode, isValid) => {
    if (!inputNode) {
      return;
    }

    inputNode.setAttribute('aria-invalid', String(!isValid));
  };

  const validateCompanyName = () => {
    const value = fields.companyName.value.trim();
    const isValid = value.length >= 2;

    setAriaInvalid(fields.companyName, isValid);
    toggleError(errors.companyName, isValid, 'Company name must have at least 2 characters');
    return isValid;
  };

  const validateContactPerson = () => {
    const value = fields.contactPerson.value.trim();
    const words = value.split(/\s+/).filter(Boolean);
    const isValid = words.length >= 2;

    setAriaInvalid(fields.contactPerson, isValid);
    toggleError(errors.contactPerson, isValid, 'Enter first and last name of contact');
    return isValid;
  };

  const validateEmail = () => {
    const value = fields.email.value.trim();
    const corporateEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = corporateEmailPattern.test(value);

    setAriaInvalid(fields.email, isValid);
    toggleError(errors.email, isValid, 'Enter a valid corporate email (example: name@company.com)');
    return isValid;
  };

  const validatePhone = () => {
    const value = fields.phone.value.trim();
    const phonePattern = /^\+\d{1,3}(\s?\d){6,14}$/;
    const isValid = phonePattern.test(value);

    setAriaInvalid(fields.phone, isValid);
    toggleError(errors.phone, isValid, 'Phone must include country code (example: +1 213 555 0147)');
    return isValid;
  };

  const validateWebsite = () => {
    const value = fields.website.value.trim();
    if (value.length === 0) {
      setAriaInvalid(fields.website, true);
      toggleError(errors.website, true, 'If you include website, it must be a valid URL');
      return true;
    }

    const isValid = /^https?:\/\/.+/i.test(value);
    setAriaInvalid(fields.website, isValid);
    toggleError(errors.website, isValid, 'If you include website, it must be a valid URL');
    return isValid;
  };

  const validateSelectRequired = (selectNode, errorNode, message) => {
    const isValid = selectNode.value.trim().length > 0;
    setAriaInvalid(selectNode, isValid);
    toggleError(errorNode, isValid, message);
    return isValid;
  };

  const validateServices = () => {
    const hasSelection = servicesCheckboxes.some((checkbox) => checkbox.checked);

    servicesCheckboxes.forEach((checkbox) => {
      setAriaInvalid(checkbox, hasSelection);
    });

    toggleError(errors.services, hasSelection, 'Select at least one service of interest');
    return hasSelection;
  };

  const validateCurrent3pl = () => {
    const hasSelection = current3plRadios.some((radio) => radio.checked);

    current3plRadios.forEach((radio) => {
      setAriaInvalid(radio, hasSelection);
    });

    toggleError(errors.current3pl, hasSelection, 'Indicate if you currently work with another logistics provider');
    return hasSelection;
  };

  const updateCommentsCounter = () => {
    const currentLength = fields.comments.value.length;
    const remaining = MAX_COMMENTS - currentLength;

    if (commentsCounter) {
      commentsCounter.textContent = `${remaining} remaining`;
    }

    const isValid = remaining >= 0;
    setAriaInvalid(fields.comments, isValid);

    const commentsMessage = `Comments cannot exceed 500 characters (${remaining} remaining)`;
    toggleError(errors.comments, isValid, commentsMessage);

    return isValid;
  };

  const validatePrivacyPolicy = () => {
    const isValid = fields.privacyPolicy.checked;
    setAriaInvalid(fields.privacyPolicy, isValid);
    toggleError(errors.privacyPolicy, isValid, 'You must accept the privacy policy to continue');
    return isValid;
  };

  const updateLowVolumeWarning = () => {
    const lowVolumeSelected = fields.monthlyVolume.value === '0-100 shipments/month';
    const hasProductType = fields.productType.value.trim().length > 0;
    const showWarning = lowVolumeSelected && hasProductType;

    if (lowVolumeWarning) {
      lowVolumeWarning.classList.toggle('hidden', !showWarning);
    }
  };

  const validateForm = () => {
    const validations = [
      validateCompanyName(),
      validateContactPerson(),
      validateEmail(),
      validatePhone(),
      validateWebsite(),
      validateSelectRequired(fields.country, errors.country, 'Select main operating country'),
      validateSelectRequired(fields.productType, errors.productType, 'Select the type of product you handle'),
      validateSelectRequired(fields.monthlyVolume, errors.monthlyVolume, 'Select estimated monthly volume'),
      validateServices(),
      validateCurrent3pl(),
      updateCommentsCounter(),
      validatePrivacyPolicy(),
    ];

    updateLowVolumeWarning();

    return validations.every(Boolean);
  };

  const validateStep = (step) => {
    if (step === 1) {
      return [validateCompanyName(), validateContactPerson(), validateEmail(), validatePhone(), validateWebsite()].every(Boolean);
    }

    if (step === 2) {
      const results = [
        validateSelectRequired(fields.country, errors.country, 'Select main operating country'),
        validateSelectRequired(fields.productType, errors.productType, 'Select the type of product you handle'),
        validateSelectRequired(fields.monthlyVolume, errors.monthlyVolume, 'Select estimated monthly volume'),
      ];
      updateLowVolumeWarning();
      return results.every(Boolean);
    }

    if (step === 3) {
      return [validateServices(), validateCurrent3pl(), updateCommentsCounter(), validatePrivacyPolicy()].every(Boolean);
    }

    return true;
  };

  const focusFirstInvalidInStep = (step) => {
    const stepContainer = stepContainers.find((container) => Number(container.getAttribute('data-form-step')) === step);
    if (!stepContainer) {
      return;
    }

    const firstInvalidField = stepContainer.querySelector('[aria-invalid="true"]');
    if (!firstInvalidField) {
      return;
    }

    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstInvalidField.focus({ preventScroll: true });
  };

  const renderStep = () => {
    stepContainers.forEach((container) => {
      const step = Number(container.getAttribute('data-form-step'));
      container.classList.toggle('hidden', step !== currentStep);
    });

    stepIndicators.forEach((indicator) => {
      const step = Number(indicator.getAttribute('data-step-indicator'));
      const isCompletedOrCurrent = step <= currentStep;

      indicator.classList.toggle('bg-[#00f49c]', isCompletedOrCurrent);
      indicator.classList.toggle('text-black', isCompletedOrCurrent);
      indicator.classList.toggle('border', !isCompletedOrCurrent);
      indicator.classList.toggle('border-white/30', !isCompletedOrCurrent);
      indicator.classList.toggle('text-white', !isCompletedOrCurrent);
    });

    if (stepDescription) {
      stepDescription.textContent = STEP_TEXTS[currentStep] || '';
    }

    if (backButton) {
      const isFirstStep = currentStep === 1;
      backButton.disabled = isFirstStep;
    }

    if (nextButton) {
      const isLastStep = currentStep === 3;
      nextButton.textContent = isLastStep ? 'Request info' : 'Next';
    }
  };

  const showSuccessMessage = () => {
    if (!successMessage) {
      return;
    }

    quoteForm.classList.add('hidden');

    if (stepDescription) {
      stepDescription.classList.add('hidden');
    }

    if (stepperContainer) {
      stepperContainer.classList.add('hidden');
    }

    successMessage.classList.remove('hidden');
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  fields.companyName.addEventListener('blur', validateCompanyName);
  fields.contactPerson.addEventListener('blur', validateContactPerson);
  fields.email.addEventListener('blur', validateEmail);
  fields.phone.addEventListener('blur', validatePhone);
  fields.website.addEventListener('blur', validateWebsite);
  fields.country.addEventListener('change', () => {
    validateSelectRequired(fields.country, errors.country, 'Select main operating country');
  });
  fields.productType.addEventListener('change', () => {
    validateSelectRequired(fields.productType, errors.productType, 'Select the type of product you handle');
    updateLowVolumeWarning();
  });
  fields.monthlyVolume.addEventListener('change', () => {
    validateSelectRequired(fields.monthlyVolume, errors.monthlyVolume, 'Select estimated monthly volume');
    updateLowVolumeWarning();
  });
  fields.comments.addEventListener('input', updateCommentsCounter);
  fields.privacyPolicy.addEventListener('change', validatePrivacyPolicy);

  servicesCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', validateServices);
  });

  current3plRadios.forEach((radio) => {
    radio.addEventListener('change', validateCurrent3pl);
  });

  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (currentStep !== 3) {
      return;
    }

    if (!validateForm()) {
      focusFirstInvalidInStep(3);
      return;
    }

    showSuccessMessage();
  });

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentStep < 3) {
        const isCurrentStepValid = validateStep(currentStep);
        if (!isCurrentStepValid) {
          focusFirstInvalidInStep(currentStep);
          return;
        }

        currentStep = Math.min(currentStep + 1, 3);
        renderStep();
        return;
      }

      if (!validateForm()) {
        focusFirstInvalidInStep(3);
        return;
      }

      showSuccessMessage();
    });
  }

  if (backButton) {
    backButton.addEventListener('click', () => {
      currentStep = Math.max(currentStep - 1, 1);
      renderStep();
    });
  }

  updateCommentsCounter();
  updateLowVolumeWarning();
  renderStep();
}
