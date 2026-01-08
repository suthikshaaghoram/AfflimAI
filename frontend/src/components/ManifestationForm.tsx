import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/FormSection";
import { FormField } from "@/components/FormField";
import { GenerationModeSelector } from "@/components/GenerationModeSelector";
import { ManifestationRequest, getLastSubmission, ingestProfile, summarizeProfile } from "@/lib/api";
import { User, Star, Heart, Target, Sparkles, Wand2, History, Linkedin } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ManifestationFormProps {
  onSubmit: (data: ManifestationRequest) => void;
  isLoading: boolean;
  initialData?: Partial<ManifestationRequest>;
}

const initialFormState: ManifestationRequest = {
  preferred_name: "",
  birth_date: "",
  birth_time: "",
  birth_place: "",
  nakshatra: "",
  lagna: "",
  strengths: "",
  areas_of_improvement: "",
  greatest_achievement: "",
  recent_achievement: "",
  next_year_goals: "",
  life_goals: "",
  legacy: "",
  manifestation_focus: "",
};

export function ManifestationForm({ onSubmit, isLoading, initialData }: ManifestationFormProps) {
  const [formData, setFormData] = useState<ManifestationRequest>({
    ...initialFormState,
    ...initialData // Merge initial data if present
  });
  const [generationMode, setGenerationMode] = useState<"quick" | "deep">("deep");
  const [isLinkedInOpen, setIsLinkedInOpen] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const updateField = (field: keyof ManifestationRequest) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add generation_mode to form data
    onSubmit({ ...formData, generation_mode: generationMode });
  };

  const handleAutoFill = async () => {
    try {
      const lastData = await getLastSubmission();
      setFormData(lastData);
      toast.success("✨ Form filled with your last data!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load previous data");
    }
  };

  const handleLinkedInImport = async () => {
    if (!linkedinUrl.trim()) return;

    setIsImporting(true);
    try {
      toast.info("Connecting to LinkedIn... Please confirm login in the browser window if requested.");

      // 1. Ingest
      const ingestResult = await ingestProfile({ linkedin_url: linkedinUrl });
      toast.info("Profile data extracted! Analysing...");

      // 2. Summarize
      const summaryResult = await summarizeProfile(ingestResult.raw_profile_text);

      // 3. Update Form
      // 3. Update Form
      const sanitizedData = Object.fromEntries(
        Object.entries(summaryResult.manifestation_data).map(([key, value]) => [key, value ?? ""])
      );

      setFormData(prev => ({
        ...prev,
        ...sanitizedData
      }));

      toast.success("✨ Profile imported successfully!");
      setIsLinkedInOpen(false);
      setLinkedinUrl("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to import LinkedIn profile. Check the logs.");
    } finally {
      setIsImporting(false);
    }
  };

  const isFormValid = !!formData.preferred_name;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Details */}
      <FormSection
        title="Personal Details"
        description="Tell us about yourself ✦"
        icon={<User className="w-6 h-6" />}
        accentColor="orange"
      >
        <div className="flex justify-end mb-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAutoFill}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors gap-2"
          >
            <History className="w-4 h-4" />
            Auto-fill last data
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsLinkedInOpen(true)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors gap-2"
          >
            <Linkedin className="w-4 h-4" />
            Import from LinkedIn
          </Button>
        </div>

        <Dialog open={isLinkedInOpen} onOpenChange={setIsLinkedInOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import from LinkedIn</DialogTitle>
              <DialogDescription>
                Enter your LinkedIn profile URL. We will extract your details to personalize your manifestation.
                <br />
                <span className="text-xs text-muted-foreground mt-2 block">
                  ⚠️ Requires a browser window to open for secure login. Please solve any captchas if they appear.
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="https://www.linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLinkedInOpen(false)} disabled={isImporting}>
                Cancel
              </Button>
              <Button onClick={handleLinkedInImport} disabled={isImporting || !linkedinUrl}>
                {isImporting ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" /> Importing...
                  </>
                ) : (
                  "Import Profile"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="grid sm:grid-cols-2 gap-5">
          <FormField
            label="Preferred Name"
            name="preferred_name"
            placeholder="How would you like to be addressed?"
            required
            value={formData.preferred_name}
            onChange={updateField("preferred_name")}
          />
          <FormField
            label="Birth Place"
            name="birth_place"
            placeholder="City, Country"
            value={formData.birth_place}
            onChange={updateField("birth_place")}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <FormField
            label="Birth Date"
            name="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={updateField("birth_date")}
          />
          <FormField
            label="Birth Time"
            name="birth_time"
            type="time"
            helperText="Approximate time is fine"
            value={formData.birth_time}
            onChange={updateField("birth_time")}
          />
        </div>
      </FormSection>

      {/* Vedic Astrology */}
      <FormSection
        title="Vedic Astrology Context"
        description="Optional cosmic alignment for deeper personalization ⭐"
        icon={<Star className="w-6 h-6" />}
        accentColor="gold"
      >
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <FormField
              label="Nakshatra"
              name="nakshatra"
              type="select"
              placeholder="Select your birth star"
              helperText="Your birth star"
              value={formData.nakshatra}
              onChange={updateField("nakshatra")}
              options={[
                "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra",
                "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
                "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
                "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
                "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
              ]}
            />
            <FormField
              label="Lagna / Ascendant"
              name="lagna"
              type="select"
              placeholder="Select your rising sign"
              helperText="Your rising sign"
              value={formData.lagna}
              onChange={updateField("lagna")}
              options={[
                "Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karka)",
                "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrishchika)",
                "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"
              ]}
            />
          </div>
        </div>
      </FormSection>

      {/* Personal Profile */}
      <FormSection
        title="Personal Profile"
        description="Celebrate your journey and growth 💖"
        icon={<Heart className="w-6 h-6" />}
        accentColor="pink"
      >
        <FormField
          label="Your Strengths"
          name="strengths"
          type="textarea"
          placeholder="What are your core strengths and talents that make you shine?"
          value={formData.strengths}
          onChange={updateField("strengths")}
        />
        <FormField
          label="Areas of Growth"
          name="areas_of_improvement"
          type="textarea"
          placeholder="What aspects of yourself are you nurturing and developing?"
          value={formData.areas_of_improvement}
          onChange={updateField("areas_of_improvement")}
        />
        <FormField
          label="Greatest Achievement in Life"
          name="greatest_achievement"
          type="textarea"
          placeholder="What accomplishment fills your heart with pride?"
          value={formData.greatest_achievement}
          onChange={updateField("greatest_achievement")}
        />
        <FormField
          label="Recent Win"
          name="recent_achievement"
          type="textarea"
          placeholder="What did you accomplish recently that made you proud?"
          value={formData.recent_achievement}
          onChange={updateField("recent_achievement")}
        />
      </FormSection>

      {/* Goals & Vision */}
      <FormSection
        title="Dreams & Vision"
        description="Define your beautiful future 🎯"
        icon={<Target className="w-6 h-6" />}
        accentColor="sage"
      >
        <FormField
          label="Next Year Goals"
          name="next_year_goals"
          type="textarea"
          placeholder="What exciting achievements await you in the coming year?"
          value={formData.next_year_goals}
          onChange={updateField("next_year_goals")}
        />
        <FormField
          label="Life Goals with Timeline"
          name="life_goals"
          type="textarea"
          placeholder="What are your major life dreams and by when will you achieve them?"
          rows={4}
          value={formData.life_goals}
          onChange={updateField("life_goals")}
        />
        <FormField
          label="Your Legacy"
          name="legacy"
          type="textarea"
          placeholder="How do you want to be remembered? What impact will you leave?"
          value={formData.legacy}
          onChange={updateField("legacy")}
        />
      </FormSection>

      {/* Manifestation Focus */}
      <FormSection
        title="Manifestation Focus"
        description="The heart of your affirmation ✨"
        icon={<Sparkles className="w-6 h-6" />}
        accentColor="blue"
      >
        <FormField
          label="One Thing to Manifest"
          name="manifestation_focus"
          type="textarea"
          placeholder="What is the one beautiful thing you want to bring into your life right now? Dream big!"
          helperText="Be specific and heartfelt — the universe loves clarity"
          rows={4}
          value={formData.manifestation_focus}
          onChange={updateField("manifestation_focus")}
        />
      </FormSection>

      {/* Generation Mode Selector - NEW */}
      <FormSection
        title="Generation Length"
        description="Choose your manifestation depth 🎚️"
        icon={<Wand2 className="w-6 h-6" />}
        accentColor="purple"
      >
        <GenerationModeSelector
          value={generationMode}
          onChange={setGenerationMode}
          disabled={isLoading}
        />
      </FormSection>

      {/* Submit Button */}
      <div className="pt-8 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-20 bg-gradient-to-r from-sunrise-pink/20 via-sunrise-gold/20 to-sage/20 blur-2xl rounded-full" />
        </div>
        <Button
          type="submit"
          variant="default"
          size="lg"
          disabled={!isFormValid || isLoading}
          className="relative w-full h-16 text-lg font-semibold gradient-button shadow-button hover:shadow-glow transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] rounded-2xl group"
        >
          <Wand2 className="w-6 h-6 mr-3 group-hover:animate-wave" />
          {isLoading ? "Creating Magic..." : "Generate My Manifestation"}
          <Sparkles className="w-5 h-5 ml-3 animate-twinkle" />
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-5 flex items-center justify-center gap-2">
          <Star className="w-4 h-4 text-sunrise-gold" />
          Your personalized {generationMode === "quick" ? "quick" : "deep"} manifestation awaits
          <Star className="w-4 h-4 text-sunrise-gold" />
        </p>
      </div>
    </form>
  );
}
