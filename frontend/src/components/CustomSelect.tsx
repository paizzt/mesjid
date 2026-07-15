import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  value?: string | number;
  onChange?: (e: any) => void;
  children: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  value, 
  onChange, 
  children, 
  className = '', 
  name, 
  required,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse children to extract options
  const options: { value: string | number; label: React.ReactNode }[] = [];
  
  React.Children.forEach(children, child => {
    if (React.isValidElement(child) && child.type === 'option') {
      const optionChild = child as React.ReactElement<any>;
      options.push({
        value: optionChild.props.value !== undefined ? optionChild.props.value : optionChild.props.children?.toString() || '',
        label: optionChild.props.children
      });
    } else if (React.isValidElement(child) && child.type === React.Fragment) {
       // If options are wrapped in a fragment
       const fragmentChild = child as React.ReactElement<any>;
       React.Children.forEach(fragmentChild.props.children, subChild => {
         if (React.isValidElement(subChild) && subChild.type === 'option') {
            const subOptionChild = subChild as React.ReactElement<any>;
            options.push({
              value: subOptionChild.props.value !== undefined ? subOptionChild.props.value : subOptionChild.props.children?.toString() || '',
              label: subOptionChild.props.children
            });
         }
       });
    }
  });

  const selectedOption = options.find(opt => String(opt.value) === String(value)) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optValue: string | number) => {
    if (onChange && !disabled) {
      onChange({ target: { value: optValue, name } });
    }
    setIsOpen(false);
  };

  // Clean the original className to prevent double borders but keep sizing
  const isWFull = className.includes('w-full');
  const baseClasses = `relative ${isWFull ? 'w-full' : ''}`;
  const customStyles = "flex items-center justify-between px-4 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm cursor-pointer hover:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200";

  return (
    <div className={baseClasses} ref={dropdownRef}>
      {/* Hidden native select for form data/accessibility */}
      <select 
        name={name} 
        value={value} 
        onChange={onChange} 
        className="hidden" 
        required={required}
        disabled={disabled}
      >
        {children}
      </select>
      
      <div
        className={`${customStyles} ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="block truncate text-slate-700 text-sm font-medium">
          {selectedOption ? selectedOption.label : 'Pilih...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-[100] w-full mt-1 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto py-2">
          {options.map((opt, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer hover:bg-emerald-50 transition-colors ${
                String(opt.value) === String(value) ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-700'
              }`}
              onClick={() => handleSelect(opt.value)}
            >
              <span className="truncate">{opt.label}</span>
              {String(opt.value) === String(value) && (
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
