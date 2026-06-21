import { ChangeDetectionStrategy, Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, FormGroupDirective } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ProfileService, Profile } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type DocumentType = 'pdf' | 'docx';

interface DocumentFormatOption {
  value: DocumentType;
  label: string;
  icon: string;
  hint: string;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    UpperCasePipe,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTabsModule,
    MatDatepickerModule
  ],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePageComponent implements OnInit {
  @ViewChild('passwordFormDir') private passwordFormDir?: FormGroupDirective;

  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly profile = signal<Profile | null>(null);
  readonly profileLoading = signal(true);
  readonly profileError = signal('');

  readonly editMode = signal(false);
  readonly editLoading = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly fileError = signal('');

  readonly passwordLoading = signal(false);
  readonly hideOld = signal(true);
  readonly hideNew = signal(true);
  readonly hideConfirm = signal(true);

  readonly documentFormats: DocumentFormatOption[] = [
    { value: 'pdf',  label: 'PDF Document',  icon: 'picture_as_pdf', hint: 'Best for printing and sharing' },
    { value: 'docx', label: 'Word Document', icon: 'description',    hint: 'Editable in Microsoft Word' }
  ];

  readonly selectedDocumentType = signal<DocumentType>('pdf');
  readonly downloadingDocument = signal(false);
  readonly apiUrl = environment.apiUrl.replace('/api', '');

  readonly editForm = this.fb.group({
    fullName:     ['', Validators.required],
    dateOfBirth:  ['', Validators.required],
    email:        ['', [Validators.required, Validators.email]],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    address:      ['', Validators.required]
  });

  readonly passwordForm = this.fb.group({
    oldPassword:     ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    if (!this.profileService.getCachedHasProfile()) {
      this.profileLoading.set(false);
      return;
    }

    const cached = this.profileService.profile();
    if (cached) {
      this.profile.set(cached);
      this.profileLoading.set(false);
      return;
    }

    this.loadProfile();
  }

  loadProfile(): void {
    this.profileLoading.set(true);
    this.profileService.getProfile().pipe(
      finalize(() => this.profileLoading.set(false))
    ).subscribe({
      next: (data) => this.profile.set(data),
      error: (err) => {
        if (err.status === 404) {
          this.profileService.setHasProfile(false);
          this.router.navigate(['/form']);
          return;
        }
        const msg = err.error?.message ?? 'Failed to load profile';
        this.profileError.set(msg);
        this.toastr.error(msg, 'Error');
      }
    });
  }

  startEdit(): void {
    const p = this.profile();
    if (!p) return;
    this.selectedFile.set(null);
    this.fileError.set('');
    this.editForm.patchValue({
      fullName:     (p['fullName'] ?? p['full_name']) as string,
      dateOfBirth:  new Date((p['dateOfBirth'] ?? p['date_of_birth']) as string) as any,
      email:        p['email'] as string,
      mobileNumber: (p['mobileNumber'] ?? p['phone_number']) as string,
      address:      p['address'] as string
    });
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.editMode.set(false);
    this.editForm.reset();
    this.selectedFile.set(null);
    this.fileError.set('');
  }

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

  onUpdateProfile(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.editLoading.set(true);
    const values = this.editForm.getRawValue();
    const formData = new FormData();
    formData.append('full_name', values.fullName!);
    formData.append('date_of_birth', new Date(values.dateOfBirth!).toISOString());
    formData.append('email', values.email!);
    formData.append('phone_number', values.mobileNumber!);
    formData.append('address', values.address!);
    const file = this.selectedFile();
    if (file) {
      formData.append('attachment', file);
    }

    this.profileService.updateProfile(formData).pipe(
      finalize(() => this.editLoading.set(false))
    ).subscribe({
      next: (res) => {
        this.profile.set(res.data);
        this.editMode.set(false);
        this.selectedFile.set(null);
        this.fileError.set('');
        this.toastr.success(res.message, 'Success');
      },
      error: (err) => {
        this.toastr.error(err.error?.message, 'Error');
      }
    });
  }

  passwordMatchValidator(group: AbstractControl) {
    const np = group.get('newPassword')?.value;
    const cp = group.get('confirmPassword')?.value;
    return np === cp ? null : { passwordMismatch: true };
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordLoading.set(true);
    const { oldPassword, newPassword } = this.passwordForm.getRawValue();

    this.auth.changePassword({
      oldPassword: oldPassword!,
      newPassword: newPassword!
    }).pipe(
      finalize(() => this.passwordLoading.set(false))
    ).subscribe({
      next: (res) => {
        this.passwordFormDir?.resetForm();
        this.hideOld.set(true);
        this.hideNew.set(true);
        this.hideConfirm.set(true);
        this.toastr.success(res.message, 'Success');
      },
      error: (err) => {
        this.toastr.error(err.error?.message, 'Error');
      }
    });
  }

  onDownloadDocument(): void {
    const type = this.selectedDocumentType();
    this.downloadingDocument.set(true);
    this.profileService.downloadDocument(type).pipe(
      finalize(() => this.downloadingDocument.set(false))
    ).subscribe({
      error: () => this.toastr.error(`Failed to download ${type.toUpperCase()}`, 'Error')
    });
  }

  selectedFormat(): DocumentFormatOption {
    return this.documentFormats.find(f => f.value === this.selectedDocumentType())!;
  }

  downloadFileName(): string {
    return `personal-details.${this.selectedDocumentType()}`;
  }

  logout(): void {
    this.auth.logout();
  }

  getFileUrl(filePath: string): string {
    if (!filePath) return '';
    const filename = filePath.replace(/\\/g, '/').split('/').pop();
    return `${this.apiUrl}/uploads/${filename}`;
  }
}
