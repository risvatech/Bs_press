import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Industrial variants
        industrial: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        "industrial-outline": "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        // Hero variants - Orange gradient
        hero: "bg-gradient-to-r from-accent to-orange-400 text-accent-foreground hover:from-accent/90 hover:to-orange-400/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-bold",
        "hero-outline": "border-2 border-primary-foreground/80 bg-transparent text-primary-foreground hover:bg-primary-foreground/10",
        // Teal variant
        teal: "bg-teal text-teal-foreground hover:bg-teal/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        "teal-outline": "border-2 border-teal bg-transparent text-teal hover:bg-teal hover:text-teal-foreground",
        // CTA variant
        cta: "bg-gradient-to-r from-accent to-orange-400 text-accent-foreground hover:opacity-90 shadow-lg text-base px-8 py-4",
        // Navigation
        nav: "bg-transparent text-foreground hover:text-primary hover:bg-transparent font-medium",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8 text-base",
        xl: "h-14 rounded-md px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
