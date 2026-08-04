type ButtonVariant = "primary" | "secondary" | "destructive" | "outline";

type ButtonSize = "small" | "medium" | "large";

type ButtonProps = { 
    children: React.ReactNode; 
    onClick?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-[#b56b49] text-[#fff8f1] transition hover:bg-[#a95f40]",
    secondary: "bg-[#6f8f82] text-[#fff8f1] transition hover:bg-[#5e7a6f]",
    destructive: "bg-red-500 text-[#fff8f1] transition hover:bg-red-600",
    outline: "border border-[#d8cabd] text-[#4d4037] transition hover:bg-[#efe6d8]"
}

const sizeStyles: Record<ButtonSize, string> = {
    small: "px-4 py-2.5 text-sm",
    medium: "px-5 py-3 text-sm",
    large: "px-7 py-4 text-lg"
}

export default function Button({ children, onClick, variant = "primary", size = "medium", type = "button", disabled }: ButtonProps) {
    return (
        <button type={type} disabled={disabled} className={`rounded-full font-semibold ${variantStyles[variant]} ${sizeStyles[size]}`} onClick={onClick}>
            {children}
        </button>
    );
}