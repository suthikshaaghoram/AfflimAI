import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { FormSection } from "@/components/FormSection";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getLastSubmission, ingestProfile, summarizeProfile } from "@/lib/api";
import { User, History, Linkedin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { StepProps } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Helper to parse 24h time to 12h parts
const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: "12", minute: "00", period: "AM" };
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    let hour = h % 12;
    if (hour === 0) hour = 12;
    return {
        hour: hour.toString().padStart(2, "0"),
        minute: m.toString().padStart(2, "0"),
        period
    };
};

export function PersonalDetailsStep({ formData, updateField, setFormData }: StepProps) {
    const [isLinkedInOpen, setIsLinkedInOpen] = useState(false);
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [isImporting, setIsImporting] = useState(false);

    // Initialize local time state from formData
    const initialTime = parseTime(formData.birth_time);
    const [timeState, setTimeState] = useState(initialTime);

    // Update time whenever formData.birth_time changes externally (e.g. autofill)
    // We need a way to sync if parent updates it without causing loops.
    useEffect(() => {
        const parsed = parseTime(formData.birth_time);
        // Only update if significantly different to avoid cursor jumping or loops
        if (parsed.hour !== timeState.hour || parsed.minute !== timeState.minute || parsed.period !== timeState.period) {
            setTimeState(parsed);
        }
    }, [formData.birth_time]);

    // Helper to update parent
    const updateTime = (key: "hour" | "minute" | "period", value: string) => {
        const newState = { ...timeState, [key]: value };
        setTimeState(newState);

        let h = parseInt(newState.hour);
        const m = parseInt(newState.minute);

        if (isNaN(h)) h = 12;
        if (isNaN(m)) m = 0;

        if (newState.period === "PM" && h < 12) h += 12;
        if (newState.period === "AM" && h === 12) h = 0;

        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        updateField("birth_time")(timeStr);
    };

    const handleAutoFill = async () => {
        try {
            const lastData = await getLastSubmission();
            setFormData((prev) => ({ ...prev, ...lastData }));
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

    return (
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
                    onChange={(val) => {
                        updateField("birth_place")(val);
                    }}
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

                {/* Custom Time Picker */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Birth Time</Label>
                    <div className="flex gap-2">
                        {/* Hour */}
                        <div className="relative flex-1">
                            <Input
                                type="number"
                                min={1}
                                max={12}
                                placeholder="HH"
                                value={timeState.hour}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    // Basic clamping
                                    if (val && parseInt(val) > 12) val = "12";
                                    if (val.length > 2) val = val.slice(0, 2);
                                    updateTime("hour", val);
                                }}
                                className="w-full text-center"
                            />
                            <span className="text-[10px] text-muted-foreground absolute -bottom-4 left-1/2 -translate-x-1/2">Hour</span>
                        </div>

                        <span className="flex items-center text-muted-foreground pb-2">:</span>

                        {/* Minute */}
                        <div className="relative flex-1">
                            <Input
                                type="number"
                                min={0}
                                max={59}
                                placeholder="MM"
                                value={timeState.minute}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (val && parseInt(val) > 59) val = "59";
                                    if (val.length > 2) val = val.slice(0, 2);
                                    updateTime("minute", val);
                                }}
                                className="w-full text-center"
                            />
                            <span className="text-[10px] text-muted-foreground absolute -bottom-4 left-1/2 -translate-x-1/2">Min</span>
                        </div>

                        {/* AM/PM */}
                        <div className="flex-1">
                            <Select
                                value={timeState.period}
                                onValueChange={(val) => updateTime("period", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
        </FormSection>
    );
}
