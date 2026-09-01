/**
 * Builtin-to-user preset conversion functions.
 * Pure data transformations — no component state.
 */

import { rgbToXy } from './color-utils';
import type {
  AudioEffectConfig,
  CCTSequencePreset,
  DynamicEffectPreset,
  DynamicScenePreset,
  SegmentPatternPreset,
  SegmentSequencePreset,
  UserCCTSequencePreset,
  UserDynamicScenePreset,
  UserEffectPreset,
  UserSegmentPatternPreset,
  UserSegmentSequencePreset,
} from './types';

export function scaleSegmentPattern<T>(source: T[], targetCount: number): T[] {
  const sourceCount = source.length;
  if (targetCount < 1 || sourceCount < 1) return [];
  if (targetCount === sourceCount) return [...source];
  return Array.from({ length: targetCount }, (_, i) =>
    source[Math.floor(i * sourceCount / targetCount)]!
  );
}

export function builtinEffectToUser(
  preset: DynamicEffectPreset, deviceType: string, copyLabel: string,
): UserEffectPreset {
  const result: UserEffectPreset = {
    id: '',
    name: `${preset.name} ${copyLabel}`,
    effect: preset.effect,
    effect_speed: preset.speed,
    effect_brightness: preset.brightness != null ? Math.round(preset.brightness / 255 * 100) : 100,
    effect_colors: preset.colors.map((c) => rgbToXy(c[0]!, c[1]!, c[2]!)),
    device_type: deviceType,
    created_at: '',
    modified_at: '',
  };
  // Copy audio-reactive fields if present
  if (preset.audio_speed_mode) {
    result.audio_config = {
      audio_entity: '',
      audio_sensitivity: preset.audio_sensitivity,
      audio_silence_behavior: preset.audio_silence_behavior as AudioEffectConfig['audio_silence_behavior'],
      audio_speed_mode: preset.audio_speed_mode as AudioEffectConfig['audio_speed_mode'],
      audio_speed_min: preset.audio_speed_min,
      audio_speed_max: preset.audio_speed_max,
    };
  }
  return result;
}

export function builtinPatternToUser(
  preset: SegmentPatternPreset, deviceType: string, targetSegmentCount: number, copyLabel: string,
): UserSegmentPatternPreset {
  const scaled = scaleSegmentPattern(preset.segments, targetSegmentCount);
  return {
    id: '',
    name: `${preset.name} ${copyLabel}`,
    device_type: deviceType,
    segments: scaled.map((seg, index) => ({
      segment: index + 1,
      color: { r: seg[0]!, g: seg[1]!, b: seg[2]! },
    })),
    created_at: '',
    modified_at: '',
  };
}

export function builtinCCTToUser(
  preset: CCTSequencePreset, copyLabel: string,
): UserCCTSequencePreset {
  const mode = (preset as any).mode as string | undefined;
  return {
    id: '',
    name: `${preset.name} ${copyLabel}`,
    steps: mode ? [] : (preset.steps || []).map((step) => ({
      ...step,
      brightness: Math.round(step.brightness / 255 * 100),
    })),
    loop_mode: preset.loop_mode,
    loop_count: preset.loop_count,
    end_behavior: preset.end_behavior,
    ...(mode === 'solar' ? { mode: 'solar', solar_steps: ((preset as any).solar_steps || []).map((s: any) => ({
      ...s,
      brightness: Math.round(s.brightness / 255 * 100),
    })) } : {}),
    ...(mode === 'schedule' ? { mode: 'schedule', schedule_steps: ((preset as any).schedule_steps || []).map((s: any) => ({
      ...s,
      brightness: Math.round(s.brightness / 255 * 100),
    })) } : {}),
    created_at: '',
    modified_at: '',
  };
}

export function builtinSegmentSequenceToUser(
  preset: SegmentSequencePreset, deviceType: string, copyLabel: string,
): UserSegmentSequencePreset {
  return {
    id: '',
    name: `${preset.name} ${copyLabel}`,
    device_type: deviceType,
    steps: preset.steps.map((step) => ({ ...step })),
    loop_mode: preset.loop_mode,
    loop_count: preset.loop_count,
    end_behavior: preset.end_behavior,
    created_at: '',
    modified_at: '',
  };
}

export function builtinDynamicSceneToUser(
  preset: DynamicScenePreset, copyLabel: string,
): UserDynamicScenePreset {
  const result: UserDynamicScenePreset = {
    id: '',
    name: `${preset.name} ${copyLabel}`,
    colors: preset.colors.map((color) => ({ ...color })),
    transition_time: preset.transition_time,
    hold_time: preset.hold_time,
    distribution_mode: preset.distribution_mode,
    offset_delay: preset.offset_delay,
    random_order: preset.random_order,
    loop_mode: preset.loop_mode,
    loop_count: preset.loop_count,
    end_behavior: preset.end_behavior,
    created_at: '',
    modified_at: '',
  };
  // Copy audio-reactive fields if present
  if (preset.audio_color_advance) {
    result.audio_entity = preset.audio_entity;
    result.audio_sensitivity = preset.audio_sensitivity;
    result.audio_brightness_curve = preset.audio_brightness_curve;
    result.audio_brightness_min = preset.audio_brightness_min;
    result.audio_brightness_max = preset.audio_brightness_max;
    result.audio_color_advance = preset.audio_color_advance;
    result.audio_transition_speed = preset.audio_transition_speed;
    result.audio_detection_mode = preset.audio_detection_mode;
    result.audio_frequency_zone = preset.audio_frequency_zone;
    result.audio_silence_behavior = preset.audio_silence_behavior;
    result.audio_prediction_aggressiveness = preset.audio_prediction_aggressiveness;
    result.audio_latency_compensation_ms = preset.audio_latency_compensation_ms;
    result.audio_color_by_frequency = preset.audio_color_by_frequency;
    result.audio_rolloff_brightness = preset.audio_rolloff_brightness;
  }
  return result;
}

/**
 * Build the pre-filled copy used when duplicating an existing user preset.
 *
 * Mirrors the backend's `duplicate_preset()` in preset_store.py: the identity
 * and timestamp fields are cleared, and `thumbnail` is deliberately dropped.
 * Thumbnail files are not duplicated on disk, so carrying the id across would
 * leave two presets referencing one file -- deleting either would unlink it and
 * leave the survivor with a broken image. The copy falls back to the preset
 * type's generated SVG (or its icon, which is preserved), and the user can
 * re-extract an image if they want one.
 */
export function userPresetToDuplicate<
  T extends { id: string; name: string; created_at: string; modified_at: string; thumbnail?: string },
>(preset: T, copyLabel: string): T {
  return {
    ...preset,
    id: '',
    name: `${preset.name} ${copyLabel}`,
    created_at: '',
    modified_at: '',
    thumbnail: undefined,
  };
}
