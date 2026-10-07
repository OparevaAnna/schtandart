interface ICheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}

const Checkbox = ({ label, checked, onChange, count }: ICheckboxProps) => {
  return (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all duration-200 group-hover:border-blue-400" />
        {checked && (
          <svg
            className="absolute top-0 left-0 w-4 h-4 text-white pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300 select-none group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
        {label}
      </span>
      {count !== undefined && (
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          {count}
        </span>
      )}
    </label>
  );
};

export default Checkbox;