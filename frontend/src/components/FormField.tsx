import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "date" | "time" | "textarea" | "select";
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  rows?: number;
  options?: string[];
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  helperText,
  required = false,
  value,
  onChange,
  className,
  rows = 3,
  options,
}: FormFieldProps) {
  const inputId = `field-${name}`;

  return (
    <div className={cn("space-y-2 group", className)}>
      <Label htmlFor={inputId} className="text-sm font-semibold text-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-sunrise-orange">✦</span>}
      </Label>

      {type === "textarea" ? (
        <Textarea
          id={inputId}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          rows={rows}
          className="resize-none bg-card/80 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300 rounded-xl placeholder:text-muted-foreground/60 focus:shadow-soft"
        />
      ) : type === "select" ? (
        <Select onValueChange={onChange} value={value}>
          <SelectTrigger className="bg-card/80 border-border/50 focus:ring-primary/20 transition-all duration-300 rounded-xl h-12 shadow-sm">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="bg-card/80 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300 rounded-xl h-12 placeholder:text-muted-foreground/60 focus:shadow-soft"
        />
      )}

      {helperText && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="text-sunrise-gold">✧</span>
          {helperText}
        </p>
      )}
    </div>
  );
}
