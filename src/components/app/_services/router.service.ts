class RouterService {
  getSearchParams(name: string) {
    return new URLSearchParams(window.location.search).get(name);
  }

  getRedirectURLAfterLogin() {
    return encodeURI(window.location.pathname + window.location.search);
  }
}

export const routerService = new RouterService();