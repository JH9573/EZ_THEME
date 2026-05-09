import { isValidEmail } from '@/utils/validators';

export const buildRegisterPayload = ({ formData, config, captchaResponse }) => {
  const payload = {
    email: formData.email,
    password: formData.password
  };

  if (config.is_email_verify === 1) {
    payload.email_code = parseInt(formData.emailCode || formData.verificationCode);
  }

  if (formData.inviteCode) {
    payload.invite_code = formData.inviteCode;
  }

  if (config.is_recaptcha === 1 && captchaResponse) {
    payload.recaptcha_data = captchaResponse;
  }

  return payload;
};

export const validateRegisterForm = ({ formData, config, captchaResponse, t }) => {
  const errors = {};

  if (!formData.email) {
    errors.email = t('validation.required', { field: t('auth.email') });
  } else if (!isValidEmail(formData.email)) {
    errors.email = t('validation.email');
  }

  if (!formData.emailCode) {
    errors.emailCode = t('validation.required', { field: t('auth.emailCode') });
  }

  if (!formData.password) {
    errors.password = t('validation.required', { field: t('auth.password') });
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = t('auth.passwordMismatch');
  }

  if (config.is_invite_force === 1 && !formData.inviteCode) {
    errors.inviteCode = t('validation.required', { field: t('auth.inviteCode') });
  }

  if (!formData.agreeTerms) {
    errors.agreeTerms = t('auth.agreeTermsRequired');
  }

  if (config.is_recaptcha === 1 && !captchaResponse) {
    errors.captcha = t('auth.captchaRequired');
  }

  return errors;
};
