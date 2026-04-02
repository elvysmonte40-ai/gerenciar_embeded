import React from 'react';

interface PasswordStrengthProps {
  password: string;
  onValidationChange?: (isValid: boolean) => void;
}

export default function PasswordStrength({ password: initialPassword = '', onValidationChange }: PasswordStrengthProps) {
  const [password, setPassword] = React.useState(initialPassword);

  React.useEffect(() => {
    const handlePasswordChange = (e: any) => {
      if (e && e.detail !== undefined) {
        setPassword(e.detail);
      }
    };
    window.addEventListener('password-changed', handlePasswordChange);
    return () => window.removeEventListener('password-changed', handlePasswordChange);
  }, []);

  React.useEffect(() => {
    setPassword(initialPassword);
  }, [initialPassword]);

  const requirements = [
    { label: 'Pelo menos 8 caracteres', test: (p: string) => (p || '').length >= 8 },
    { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p || '') },
    { label: 'Uma letra minúscula', test: (p: string) => /[a-z]/.test(p || '') },
    { label: 'Um número', test: (p: string) => /[0-9]/.test(p || '') },
    { label: 'Um caractere especial (@$!%*?&)', test: (p: string) => /[@$!%*?&]/.test(p || '') },
  ];

  const metRequirements = requirements.filter(req => req.test(password)).length;
  const strengthPercentage = (metRequirements / requirements.length) * 100;
  
  const isValid = metRequirements === requirements.length;

  React.useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
    window.dispatchEvent(new CustomEvent('password-validation', { detail: isValid }));
  }, [isValid, onValidationChange]);

  const getStrengthColor = () => {
    if (strengthPercentage <= 20) return 'bg-red-500';
    if (strengthPercentage <= 40) return 'bg-orange-500';
    if (strengthPercentage <= 60) return 'bg-yellow-500';
    if (strengthPercentage <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (password.length === 0) return '';
    if (strengthPercentage <= 20) return 'Muito fraca';
    if (strengthPercentage <= 40) return 'Fraca';
    if (strengthPercentage <= 60) return 'Razoável';
    if (strengthPercentage <= 80) return 'Boa';
    return 'Forte';
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex justify-between items-center">
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mr-2">
          <div 
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
        <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
          {getStrengthLabel()}
        </span>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {requirements.map((req, index) => {
          const isMet = req.test(password);
          return (
            <li key={index} className="flex items-center text-[10px] sm:text-xs">
              <span className={`mr-1.5 h-4 w-4 flex items-center justify-center rounded-full ${isMet ? 'text-green-500 bg-green-50' : 'text-gray-300 bg-gray-50'}`}>
                {isMet ? (
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="h-1 w-1 bg-current rounded-full" />
                )}
              </span>
              <span className={isMet ? 'text-green-700' : 'text-text-secondary'}>
                {req.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
