import type { Router } from "@lit-labs/router";
import { routerService } from "../components/app/_services/router.service";
import type { User } from "../interfaces/user.interface";
import { canUseKeyFeatures } from "./access";

export const authGuard = (router: Router, user?: User | null): boolean => {
  if (user) return true;
  redirectToLogin(router);
  return false;
};

export const keyGuard = (router: Router, user?: User | null): boolean => {
  if (!user) {
    redirectToLogin(router);
    return false;
  }
  if (!canUseKeyFeatures(user)) {
    router.goto("/403");
    history.replaceState({}, "", "/403");
    return false;
  }
  return true;
};

const redirectToLogin = (router: Router) => {
  const origin = routerService.getRedirectURLAfterLogin();
  router.goto("/");
  history.replaceState({}, "", `/?origin=${origin}`);
};
