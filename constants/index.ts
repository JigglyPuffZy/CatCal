export const APP_NAME = "CatCal";

export const ACTIVITY_LEVELS = [
  { label: "Sedentary", value: "sedentary" },
  { label: "Lightly Active", value: "light" },
  { label: "Moderately Active", value: "moderate" },
  { label: "Very Active", value: "active" },
] as const;

export const SEX_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
] as const;

export const HEALTH_CONDITIONS = [
  { label: "Healthy", value: "healthy" },
  { label: "Overweight", value: "overweight" },
  { label: "Underweight", value: "underweight" },
  { label: "Senior Care", value: "senior" },
  { label: "Kitten Growth", value: "kitten" },
] as const;
