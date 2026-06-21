import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { ProfileService } from '../services/profile.service';

export const noProfileGuard: CanActivateFn = () => {
  const router = inject(Router);
  const profileService = inject(ProfileService);

  if (profileService.isProfileCached()) {
    return profileService.getCachedHasProfile()
      ? router.createUrlTree(['/profile'])
      : true;
  }

  return profileService.checkHasProfile().pipe(
    map(exists => exists ? router.createUrlTree(['/profile']) : true)
  );
};
