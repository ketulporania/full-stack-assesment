import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';

/** Allow /form only when user has no profile yet (uses login cache — no API call). */
export const noProfileGuard: CanActivateFn = () => {
  const router = inject(Router);
  const profileService = inject(ProfileService);

  return profileService.getCachedHasProfile()
    ? router.createUrlTree(['/profile'])
    : true;
};

/** Allow /profile only when login confirmed a profile exists (no API call). */
export const hasProfileGuard: CanActivateFn = () => {
  const router = inject(Router);
  const profileService = inject(ProfileService);

  return profileService.getCachedHasProfile()
    ? true
    : router.createUrlTree(['/form']);
};
