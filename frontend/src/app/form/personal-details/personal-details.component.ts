import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ProfileService } from '../../services/profile.service';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatDatepickerModule
  ],
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalDetailsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  form = this.fb.group({
    fullName:     ['', Validators.required],
    dateOfBirth:  ['', Validators.required],
    email:        ['', [Validators.required, Validators.email]],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    address:      ['', Validators.required]
  });

  readonly loading = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly fileError = signal('');
  readonly fileTouched = signal(false);

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileError.set('');
    this.selectedFile.set(null);

    const file = input.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      this.fileError.set('Invalid file type. Only JPG, PNG, and PDF are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.fileError.set('File too large. Maximum size is 5MB.');
      return;
    }
    this.selectedFile.set(file);
  }

  formatFileSize(size: number): string {
    return size < 1024 * 1024
      ? (size / 1024).toFixed(1) + ' KB'
      : (size / (1024 * 1024)).toFixed(2) + ' MB';
  }

  onSubmit(): void {
    this.fileTouched.set(true);

    if (!this.selectedFile()) {
      this.fileError.set('Attachment is required');
    }

    if (this.form.invalid || !this.selectedFile()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const values = this.form.getRawValue();
    const formData = new FormData();
    formData.append('full_name', values.fullName!);
    formData.append('date_of_birth', new Date(values.dateOfBirth!).toISOString());
    formData.append('email', values.email!);
    formData.append('phone_number', values.mobileNumber!);
    formData.append('address', values.address!);
    formData.append('attachment', this.selectedFile()!);

    this.profileService.saveProfile(formData).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => {
        this.toastr.success(res.message, 'Success');
        setTimeout(() => this.router.navigate(['/profile']), 500);
      },
      error: (err) => {
        this.toastr.error(err.error?.message, 'Error');
      }
    });
  }
}
