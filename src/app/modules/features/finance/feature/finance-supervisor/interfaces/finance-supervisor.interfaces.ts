export interface ProfitRequestDto {
  active: boolean;
  createBy: string;
  updateBy: string;
  profitDescription: string;
}

export interface ProfitResponseDto {
  id: string;
  active: boolean;
  profitDescription: string;
}

export interface ProductCategoryRequestDto {
  active: boolean;
  createBy: string;
  updateBy: string;
  productCategoryDescription: string;
  acount: string;
  type: string;
  profitId: string;
}

export interface ProductCategoryResponseDto {
  id: string;
  active: boolean;
  productCategoryDescription: string;
  acount: string;
  type: string;
  profit: string;
}

export interface CostTypeRequestDto {
  active: boolean;
  createBy: string;
  updateBy: string;
  costTypeDescription: string;
}

export interface CostTypeResponseDto {
  id: string;
  active: boolean;
  costTypeDescription: string;
}

export interface ProductRequestDto {
  active: boolean;
  createBy: string;
  updateBy: string;
  productDescription: string;
  productCategoryId: string;
  costTypeId: string;
}

export interface ProductResponseDto {
  id: string;
  active: boolean;
  productDescription: string;
  productCategory: string;
  costType: string;
}

export interface BusinessPlanRequestDto {
  active: boolean;
  createBy: string;
  updateBy: string;
  budget: number;
  productId: string;
  monthlyBudgetId: string;
}

export interface BusinessPlanResponseDto {
  id: string;
  active: boolean;
  budget: number;
  product: string;
  productCategory: string;
  costType: string;
  profit: string;
  monthlyBudget: string;
  annualBudget: string;
  department: string;
  budgetType: string;
}

export interface AnnualBudgetRequestDto {
  active: boolean;
  createBy: string;
  updateBy: string;
  year: number;
  departamentId: string;
  budgetTypeId: string;
}

export interface AnnualBudgetResponseDto {
  id: string;
  active: boolean;
  year: number;
  departamentId: string;
  budgetType: string;
}

export interface MonthlyBudgetRequestDto {
  active: boolean;
  createBy: string;
  updateBy: string;
  month: number;
  annualBudgetId: string;
}

export interface MonthlyBudgetResponseDto {
  id: string;
  active: boolean;
  month: number;
  annualBudgetId: string;
  annualYear: number;
}

export interface BudgetTypeRequestDto {
  active: boolean;
  createBy: string;
  updateBy: string;
  budgetTypeDescription: string;
}

export interface BudgetTypeResponseDto {
  id: string;
  active: boolean;
  budgetTypeDescription: string;
}
