import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Music, Upload, RotateCcw } from "lucide-react";
import { BackgroundTrack } from "@/lib/api";

interface BackgroundMusicCardProps {
    tracks: BackgroundTrack[];
    selectedTrackId: string;
    onTrackChange: (id: string) => void;
    volume: number;
    onVolumeChange: (val: number) => void;
    isEnabled: boolean;
    onEnabledChange: (val: boolean) => void;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
    disabled?: boolean;
}

export function BackgroundMusicCard({
    tracks,
    selectedTrackId,
    onTrackChange,
    volume,
    onVolumeChange,
    isEnabled,
    onEnabledChange,
    onUpload,
    isUploading,
    disabled = false
}: BackgroundMusicCardProps) {
    return (
        <div className={cn("relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md shadow-xl transition-all duration-300", disabled && "opacity-70 pointer-events-none")}>
            <div className="px-6 py-5 bg-black/20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-white">
                        <Music className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium">Background Music</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={cn("text-xs font-medium transition-colors", isEnabled ? "text-purple-300" : "text-gray-500")}>
                            {isEnabled ? "On" : "Off"}
                        </span>
                        <Switch
                            checked={isEnabled}
                            onCheckedChange={onEnabledChange}
                            disabled={disabled}
                            className="data-[state=checked]:bg-sunrise-orange"
                        />
                    </div>
                </div>

                <div className={cn("space-y-5 transition-all duration-300", isEnabled ? "opacity-100" : "opacity-40 pointer-events-none")}>
                    {/* Track Selector & Upload */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Select value={selectedTrackId} onValueChange={onTrackChange} disabled={disabled}>
                                <SelectTrigger className="w-full text-xs h-9 bg-white/5 border-white/10 text-white focus:ring-purple-500/50">
                                    <SelectValue placeholder="Select music" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/10 text-white">
                                    {tracks.map(track => (
                                        <SelectItem key={track.id} value={track.id} className="text-xs py-2 focus:bg-white/10 focus:text-white">
                                            {track.display_name} {track.is_default && "(Recommended)"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="relative">
                            <input
                                type="file"
                                id="bg-upload"
                                accept=".mp3,.wav"
                                className="hidden"
                                onChange={onUpload}
                                disabled={isUploading || disabled}
                            />
                            <Label
                                htmlFor="bg-upload"
                                className={cn(
                                    "h-9 px-3 flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white cursor-pointer transition-colors",
                                    isUploading && "opacity-50 cursor-wait",
                                    disabled && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isUploading ? <RotateCcw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                Upload
                            </Label>
                        </div>
                    </div>

                    {/* Volume Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-400">Intensity</span>
                            <span className="text-xs text-purple-300 font-medium">{volume}%</span>
                        </div>
                        <Slider
                            defaultValue={[20]}
                            value={[volume]}
                            max={100}
                            step={1}
                            onValueChange={(vals) => onVolumeChange(vals[0])}
                            disabled={disabled}
                            className="py-2"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
