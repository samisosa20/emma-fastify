export interface Paginate {
    isFirstPage: boolean;
    isLastPage: boolean;
    currentPage: number;
    previousPage: number | null;
    nextPage: number | null;
    pageCount: number;
    totalCount: number;
  }
  
  export interface CommonParamsPaginate {
    page?: number;
    deleted?: "1" | "0";
    size?: number;
  }
  