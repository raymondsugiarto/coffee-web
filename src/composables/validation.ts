const useValidation = () => {
  const validateEmail = (email: string): boolean => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const required = (value: string | null | undefined): string | boolean => {
    return !!value || 'This field is required';
  };

  return { validateEmail, required };
};

export default useValidation;
