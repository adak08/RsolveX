import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${className}`}
      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark
        ? <Sun size={18} className="text-amber-400" />
        : <Moon size={18} />}
    </button>
  );
}
