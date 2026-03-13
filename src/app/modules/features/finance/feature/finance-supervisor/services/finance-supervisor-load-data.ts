import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '../../../../../../../environments/environment';
import { 
  AnnualBudgetRequestDto, AnnualBudgetResponseDto, 
  BudgetTypeRequestDto, BudgetTypeResponseDto, 
  BusinessPlanRequestDto, BusinessPlanResponseDto, 
  CostTypeRequestDto, CostTypeResponseDto, 
  DepartmentResponseDto, 
  MonthlyBudgetRequestDto, MonthlyBudgetResponseDto, 
  ProductCategoryRequestDto, ProductCategoryResponseDto, 
  ProductRequestDto, ProductResponseDto, 
  ProfitRequestDto, ProfitResponseDto 
} from '../interfaces/finance-supervisor.interfaces';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const API_URL = `${environment.baseUrl}/FinanceSupervisor`;

@Injectable({
  providedIn: 'root'
})
export class FinanceSupervisorLoadData {
  private readonly _http = inject(HttpClient);

  // Resources (Signals)
  readonly profits$ = rxResource({
    stream: () => this.getAllProfits()
  });

  readonly productCategories$ = rxResource({
    stream: () => this.getAllProductCategories()
  });

  readonly costTypes$ = rxResource({
    stream: () => this.getAllCostTypes()
  });

  readonly products$ = rxResource({
    stream: () => this.getAllProducts()
  });

  readonly businessPlans$ = rxResource({
    stream: () => this.getAllBusinessPlans()
  });

  readonly annualBudgets$ = rxResource({
    stream: () => this.getAllAnnualBudgets()
  });

  readonly monthlyBudgets$ = rxResource({
    stream: () => this.getAllMonthlyBudgets()
  });

  readonly budgetTypes$ = rxResource({
    stream: () => this.getAllBudgetTypes()
  });

  readonly departments$ = rxResource({
    stream: () => this.getAllDepartments()
  });

  // Profit Methods
  private getAllProfits(): Observable<ProfitResponseDto[]> {
    return this._http.get<ProfitResponseDto[]>(`${API_URL}/v1/profit/get-all`).pipe(
      catchError(err => {
        console.error('Error fetching profits:', err);
        return of([]);
      })
    );
  }

  postProfit(dto: ProfitRequestDto): Observable<ProfitResponseDto> {
    return this._http.post<ProfitResponseDto>(`${API_URL}/v1/profit/create`, dto);
  }

  putProfit(id: string, dto: ProfitRequestDto): Observable<ProfitResponseDto> {
    return this._http.post<ProfitResponseDto>(`${API_URL}/v1/profit/update/${id}`, dto);
  }

  // ProductCategory Methods
  private getAllProductCategories(): Observable<ProductCategoryResponseDto[]> {
    return this._http.get<ProductCategoryResponseDto[]>(`${API_URL}/v1/product-category/get-all`).pipe(
      catchError(err => {
        console.error('Error fetching product categories:', err);
        return of([]);
      }),
      map(response => {
        return response.map(item => {
          return {
            ...item,
            productCategoryDescription: `${item.productCategoryDescription} - ${item.type}` 
          }
        })
      })
    );
  }

  postProductCategory(dto: ProductCategoryRequestDto): Observable<ProductCategoryResponseDto> {
    return this._http.post<ProductCategoryResponseDto>(`${API_URL}/v1/product-category/create`, dto);
  }

  putProductCategory(id: string, dto: ProductCategoryRequestDto): Observable<ProductCategoryResponseDto> {
    return this._http.post<ProductCategoryResponseDto>(`${API_URL}/v1/product-category/update/${id}`, dto);
  }

  // CostType Methods
  private getAllCostTypes(): Observable<CostTypeResponseDto[]> {
    return this._http.get<CostTypeResponseDto[]>(`${API_URL}/v1/cost-type/get-all`).pipe(
      catchError(err => {
        console.error('Error fetching cost types:', err);
        return of([]);
      })
    );
  }

  postCostType(dto: CostTypeRequestDto): Observable<CostTypeResponseDto> {
    return this._http.post<CostTypeResponseDto>(`${API_URL}/v1/cost-type/create`, dto);
  }

  putCostType(id: string, dto: CostTypeRequestDto): Observable<CostTypeResponseDto> {
    return this._http.post<CostTypeResponseDto>(`${API_URL}/v1/cost-type/update/${id}`, dto);
  }

  // Product Methods
  private getAllProducts(): Observable<ProductResponseDto[]> {
    return this._http.get<ProductResponseDto[]>(`${API_URL}/v1/product/get-all`).pipe(
      catchError(err => {
        console.error('Error fetching products:', err);
        return of([]);
      })
    );
  }

  postProduct(dto: ProductRequestDto): Observable<ProductResponseDto> {
    return this._http.post<ProductResponseDto>(`${API_URL}/v1/product/create`, dto);
  }

  putProduct(id: string, dto: ProductRequestDto): Observable<ProductResponseDto> {
    return this._http.post<ProductResponseDto>(`${API_URL}/v1/product/update/${id}`, dto);
  }

  // BusinessPlan Methods
  private getAllBusinessPlans(): Observable<BusinessPlanResponseDto[]> {
    return this._http.get<BusinessPlanResponseDto[]>(`${API_URL}/v1/business-plan/get-all`).pipe(
      catchError(err => {
        console.error('Error fetching business plans:', err);
        return of([]);
      })
    );
  }

  postBusinessPlan(dto: BusinessPlanRequestDto): Observable<BusinessPlanResponseDto> {
    return this._http.post<BusinessPlanResponseDto>(`${API_URL}/v1/business-plan/create`, dto);
  }

  putBusinessPlan(id: string, dto: BusinessPlanRequestDto): Observable<BusinessPlanResponseDto> {
    return this._http.post<BusinessPlanResponseDto>(`${API_URL}/v1/business-plan/update/${id}`, dto);
  }

  // AnnualBudget Methods
  private getAllAnnualBudgets(): Observable<AnnualBudgetResponseDto[]> {
    return this._http.get<AnnualBudgetResponseDto[]>(`${API_URL}/v1/annual-budget/get-all`).pipe(
      catchError(err => {
        console.error('Error fetching annual budgets:', err);
        return of([]);
      }),
      map(response => {
        return response.map(item => {
          return {
            ...item,
            departamentId: item.departamentId.toUpperCase()
          }
        })
      })
    );
  }

  postAnnualBudget(dto: AnnualBudgetRequestDto): Observable<AnnualBudgetResponseDto> {
    return this._http.post<AnnualBudgetResponseDto>(`${API_URL}/v1/annual-budget/create`, dto)
    .pipe(
      map(response => {
        return {
          ...response,
          departamentId: response.departamentId.toUpperCase()
        }
      })
    );
  }

  putAnnualBudget(id: string, dto: AnnualBudgetRequestDto): Observable<AnnualBudgetResponseDto> {
    return this._http.post<AnnualBudgetResponseDto>(`${API_URL}/v1/annual-budget/update/${id}`, dto);
  }

  // MonthlyBudget Methods
  private getAllMonthlyBudgets(): Observable<MonthlyBudgetResponseDto[]> {
    return this._http.get<MonthlyBudgetResponseDto[]>(`${API_URL}/v1/monthly-budget/get-all`).pipe(
      catchError(err => {
        console.error('Error fetching monthly budgets:', err);
        return of([]);
      })
    );
  }

  postMonthlyBudget(dto: MonthlyBudgetRequestDto): Observable<MonthlyBudgetResponseDto> {
    return this._http.post<MonthlyBudgetResponseDto>(`${API_URL}/v1/monthly-budget/create`, dto);
  }

  putMonthlyBudget(id: string, dto: MonthlyBudgetRequestDto): Observable<MonthlyBudgetResponseDto> {
    return this._http.post<MonthlyBudgetResponseDto>(`${API_URL}/v1/monthly-budget/update/${id}`, dto);
  }

  // BudgetType Methods
  private getAllBudgetTypes(): Observable<BudgetTypeResponseDto[]> {
    return this._http.get<BudgetTypeResponseDto[]>(`${API_URL}/v1/budget-type/get-all`).pipe(
      catchError(err => {
        console.error('Error fetching budget types:', err);
        return of([]);
      })
    );
  }

  postBudgetType(dto: BudgetTypeRequestDto): Observable<BudgetTypeResponseDto> {
    return this._http.post<BudgetTypeResponseDto>(`${API_URL}/v1/budget-type/create`, dto);
  }

  putBudgetType(id: string, dto: BudgetTypeRequestDto): Observable<BudgetTypeResponseDto> {
    return this._http.post<BudgetTypeResponseDto>(`${API_URL}/v1/budget-type/update/${id}`, dto);
  }

  // Department Methods
  private getAllDepartments(): Observable<DepartmentResponseDto[]> {
    return this._http.get<DepartmentResponseDto[]>(`${API_URL}/v1/department/get-all`).pipe(
      catchError(err => {
        console.error('Error fetching departments:', err);
        return of([]);
      })
    );
  }
}
