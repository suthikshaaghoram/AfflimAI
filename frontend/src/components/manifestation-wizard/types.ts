import { ManifestationRequest } from "@/lib/api";

export enum FormStep {
    PERSONAL_DETAILS = 0,
    VEDIC_ASTROLOGY = 1,
    PERSONAL_PROFILE = 2,
    DREAMS_VISION = 3,
    MANIFESTATION_FOCUS = 4,
    GENERATION_LENGTH = 5,
    REVIEW = 6
}

export interface StepProps {
    formData: ManifestationRequest;
    updateField: (field: keyof ManifestationRequest) => (value: string) => void;
    // Specific prop for setting the entire form data (e.g. auto-fill)
    setFormData: React.Dispatch<React.SetStateAction<ManifestationRequest>>;
    onNext?: () => void;
    onBack?: () => void;
}
