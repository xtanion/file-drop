import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground bg-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface InputBadgeProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputBadgeVariants> {
  onSave?: (value: string) => void; // Callback when input is blurred
}

const InputBadge = React.forwardRef<HTMLInputElement, InputBadgeProps>(
  ({ className, variant, onSave, ...props }, ref) => {
    const [value, setValue] = React.useState(props.value || "");

    return (
      <div className={cn(inputBadgeVariants({ variant }), "relative", className)}>
        <input
          ref={ref}
          value={value}
          className="bg-transparent border-none focus:outline-none focus:ring-0 text-current w-full"
          {...props}
        />
      </div>
    );
  }
);

InputBadge.displayName = "InputBadge";

export { InputBadge, inputBadgeVariants };
