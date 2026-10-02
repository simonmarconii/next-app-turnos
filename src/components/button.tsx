type ButtonVariant = "primary" | "secondary" | "destructive" | "outline";

type ButtonSize = "small" | "medium" | "large";

type ButtonProps = { 
    children: React.ReactNode; 
    onClick?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    className?: string;
    "aria-label"?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-[#914b32] text-[#fff8f1] transition hover:bg-[#7d3f2b]",
    secondary: "bg-[#4f6d60] text-[#fff8f1] transition hover:bg-[#40594e]",
    destructive: "bg-[#b42318] text-[#fff8f1] transition hover:bg-[#951b12]",
    outline: "border border-[#d8cabd] text-[#4d4037] transition hover:bg-[#efe6d8]"
}

const sizeStyles: Record<ButtonSize, string> = {
    small: "px-4 py-2.5 text-sm",
    medium: "px-5 py-3 text-sm",
    large: "px-7 py-4 text-lg"
}

export default function Button({ children, onClick, variant = "primary", size = "medium", type = "button", disabled, className, "aria-label": ariaLabel }: ButtonProps) {
    return (
        <button type={type} disabled={disabled} aria-label={ariaLabel} className={`${className ?? ""} rounded-full font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#914b32] ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'cursor-not-allowed opacity-55' : ''}`} onClick={onClick}>
            {children}
        </button>
    );
}
