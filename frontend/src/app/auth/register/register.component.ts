import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly form = this.fb.group({
    username:        ['', [Validators.required, Validators.minLength(3)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  readonly loading = signal(false);
  readonly hidePass = signal(true);
  readonly hideConfirm = signal(true);

  passwordMatchValidator(group: AbstractControl) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    const confirmControl = group.get('confirmPassword');

    if (pass !== confirm) {
      confirmControl?.setErrors({ ...(confirmControl.errors || {}), passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmControl?.hasError('passwordMismatch')) {
      const errors = { ...confirmControl.errors };
      delete errors['passwordMismatch'];
      confirmControl.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { username, email, password } = this.form.getRawValue();

    this.auth.register({ username: username!, email: email!, password: password! }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => {
        this.profileService.clearHasProfileCache();
        this.toastr.success(res.message, 'Success');
        setTimeout(() => this.router.navigate(['/login']), 500);
      },
      error: (err) => {
        this.toastr.error(err.error?.message, 'Error');
      }
    });
  }
}
