export type ArticleCategoryId =
  | "training-science"
  | "exercise-technique"
  | "strength-and-muscle"
  | "fat-loss"
  | "recovery"
  | "nutrition-basics"
  | "fitness-opinions";

export interface ArticleCategory {
  readonly id: ArticleCategoryId;
  readonly label: string;
}

export const articleCategories: readonly ArticleCategory[] = [
  { id: "training-science", label: "Training Science" },
  { id: "exercise-technique", label: "Exercise Technique" },
  { id: "strength-and-muscle", label: "Strength and Muscle" },
  { id: "fat-loss", label: "Fat Loss" },
  { id: "recovery", label: "Recovery" },
  { id: "nutrition-basics", label: "Nutrition Basics" },
  { id: "fitness-opinions", label: "Fitness Opinions" },
] as const;

export function getCategoryLabel(categoryId: ArticleCategoryId): string {
  return (
    articleCategories.find((category) => category.id === categoryId)?.label ??
    categoryId
  );
}
