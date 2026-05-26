import { Router } from "@lit-labs/router";
import { User } from "../interfaces/user.interface";
import { routerService } from "../components/app/_services/router.service";

export const authGuard = (router: Router, user?: User | null): boolean => {
  if (user) return true;
  routerService.getRedirectURLAfterLogin();
  router.goto("/");
  history.replaceState({}, "", "/?origin=" + routerService.getRedirectURLAfterLogin());
  return false;
};
