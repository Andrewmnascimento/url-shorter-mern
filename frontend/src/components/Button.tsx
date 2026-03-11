export const Button = ({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) => {
  return (
    <button
      className="rounded-lg bg-black text-white font-semibold px-5 h-11 text-sm
                 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors whitespace-nowrap"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}