import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  accentColor?: "orange" | "pink" | "gold" | "sage" | "blue";
}

const accentStyles = {
  orange: "from-sunrise-orange/20 to-sunrise-peach/10 border-sunrise-orange/30",
  pink: "from-lotus-pink/20 to-sunrise-pink/10 border-lotus-pink/30",
  gold: "from-sunrise-gold/20 to-secondary/50 border-sunrise-gold/30",
  sage: "from-sage/20 to-sage/5 border-sage/30",
  blue: "from-sky-blue/20 to-sky-blue/5 border-sky-blue/30",
};

const iconStyles = {
  orange: "bg-gradient-to-br from-sunrise-orange to-sunrise-gold text-primary-foreground",
  pink: "bg-gradient-to-br from-lotus-pink to-sunrise-pink text-foreground",
  gold: "bg-gradient-to-br from-sunrise-gold to-sunrise-orange text-foreground",
  sage: "bg-gradient-to-br from-sage to-sage-deep text-primary-foreground",
  blue: "bg-gradient-to-br from-sky-blue to-sage text-foreground",
};

export function FormSection({ 
  title, 
  description, 
  icon, 
  children, 
  className,
  accentColor = "orange" 
}: FormSectionProps) {
  return (
    <div className={cn(
      "space-y-6 p-6 rounded-2xl bg-gradient-to-br border transition-all duration-300 hover:shadow-soft",
      accentStyles[accentColor],
      className
    )}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl shadow-soft",
            iconStyles[accentColor]
          )}>
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="grid gap-5">
        {children}
      </div>
    </div>
  );
}
