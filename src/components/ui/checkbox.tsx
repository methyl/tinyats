export type CheckboxProps = {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
};

export function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
}: CheckboxProps) {
  return (
    <label className="relative flex items-center justify-center w-6 h-6 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate;
        }}
        onChange={(e) => onChange?.(e.target.checked)}
        className="peer sr-only"
      />
      <div
        className={`
          w-5 h-5 rounded-md border-[1.5px] transition-colors
          flex items-center justify-center
          ${
            checked || indeterminate
              ? "bg-gray-800 border-gray-800"
              : "bg-white border-gray-300 peer-hover:border-gray-500"
          }
        `}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {indeterminate && !checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 6H9"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
    </label>
  );
}
