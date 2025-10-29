import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('token') ?? '';
    request = request.clone({
      setHeaders: {
        Authorization: token ? `Token ${token}` : '',
      },
    });
  }

  return next(request);
};