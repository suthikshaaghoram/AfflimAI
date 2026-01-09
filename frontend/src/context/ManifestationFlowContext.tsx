import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";

type TranslationStatus = "idle" | "loading" | "ready" | "error";

interface FlowState {
    manifestation: string;
    username: string;
    generationMode: "quick" | "deep";
    wordCount: number;
    translations: Record<string, string>;
    translationStatus: Record<string, TranslationStatus>;
    fromSocial: boolean;
    preferences: {
        audioVoice: "male" | "female" | null;
        audioLanguage: string;
    };
}

interface FlowContextType extends FlowState {
    setManifestationData: (data: Partial<FlowState>) => void;
    updateTranslation: (lang: string, text: string) => void;
    setTranslationStatus: (lang: string, status: TranslationStatus) => void;
    updatePreferences: (prefs: Partial<FlowState["preferences"]>) => void;
    resetFlow: () => void;
}

const defaultState: FlowState = {
    manifestation: "",
    username: "",
    generationMode: "deep",
    wordCount: 0,
    translations: {},
    translationStatus: {},
    fromSocial: false,
    preferences: {
        audioVoice: null,
        audioLanguage: "en",
    },
};

const ManifestationFlowContext = createContext<FlowContextType | undefined>(undefined);

export function ManifestationFlowProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<FlowState>(defaultState);
    const location = useLocation();

    // Sync from location state if provided (Navigation safety net)
    useEffect(() => {
        if (location.state?.manifestation) {
            setState((prev) => ({
                ...prev,
                manifestation: location.state.manifestation,
                username: location.state.username || prev.username,
                // Only merge if not empty to avoid overwriting existing progress
                translations: { ...prev.translations, ...location.state.translations },
                translationStatus: { ...prev.translationStatus, ...location.state.translationStatus },
            }));
        }
    }, [location.state]);

    const setManifestationData = (data: Partial<FlowState>) => {
        setState((prev) => ({ ...prev, ...data }));
    };

    const updateTranslation = (lang: string, text: string) => {
        setState((prev) => ({
            ...prev,
            translations: { ...prev.translations, [lang]: text },
            translationStatus: { ...prev.translationStatus, [lang]: "ready" },
        }));
    };

    const setTranslationStatus = (lang: string, status: TranslationStatus) => {
        setState((prev) => ({
            ...prev,
            translationStatus: { ...prev.translationStatus, [lang]: status },
        }));
    };

    const updatePreferences = (prefs: Partial<FlowState["preferences"]>) => {
        setState((prev) => ({
            ...prev,
            preferences: { ...prev.preferences, ...prefs },
        }));
    };

    const resetFlow = () => {
        setState(defaultState);
    };

    return (
        <ManifestationFlowContext.Provider
            value={{
                ...state,
                setManifestationData,
                updateTranslation,
                setTranslationStatus,
                updatePreferences,
                resetFlow,
            }}
        >
            {children}
        </ManifestationFlowContext.Provider>
    );
}

export function useManifestationFlow() {
    const context = useContext(ManifestationFlowContext);
    if (context === undefined) {
        throw new Error("useManifestationFlow must be used within a ManifestationFlowProvider");
    }
    return context;
}
