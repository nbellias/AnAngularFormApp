import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StorageService, Contact } from '../storage.service';

// Custom Validator for matching passwords
export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const passwordAgain = control.get('passwordAgain');

  if (password && passwordAgain && password.value !== passwordAgain.value) {
    // Preserve other errors on passwordAgain when adding passwordsMismatch
    passwordAgain.setErrors({ ...passwordAgain.errors, passwordsMismatch: true });
    return { passwordsMismatch: true };
  } else if (passwordAgain) {
    // Clear only the mismatch error if they do match, or if one field is considered irrelevant
    let errors = passwordAgain.errors;
    if (errors && errors['passwordsMismatch']) {
      delete errors['passwordsMismatch'];
      if (Object.keys(errors).length === 0) errors = null;
    }
    passwordAgain.setErrors(errors);
  }
  return null;
}

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css']
})
export class ContactFormComponent implements OnInit {
  contactForm!: FormGroup;
  submitted = false;
  submissionMessage: string | null = null;
  editMode = false;
  editingContact: Contact | null = null; // Store the original contact being edited

  @Output() contactModified = new EventEmitter<void>(); 

  constructor(private fb: FormBuilder, private storageService: StorageService) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(contactToEdit?: Contact): void {
    this.editMode = !!contactToEdit;
    this.editingContact = contactToEdit || null;

    this.contactForm = this.fb.group({
      username: [contactToEdit?.username || '', [Validators.required, Validators.minLength(3)]],
      email: [contactToEdit?.email || '', [Validators.required, Validators.email]],
      password: ['', this.editMode ? [Validators.minLength(8)] : [Validators.required, Validators.minLength(8)]],
      passwordAgain: ['', this.editMode ? [] : [Validators.required, Validators.minLength(8)]],
      address: [contactToEdit?.address || '', [Validators.required, Validators.minLength(10)]],
      phone: [contactToEdit?.phone || '', [Validators.pattern('^[+]?[0-9]{10,13}$')]],
      comment: [contactToEdit?.comment || '']
    }, { validators: passwordsMatchValidator });

    if (this.editMode) {
      // In edit mode, password fields are optional. If user starts typing in password, then passwordAgain becomes required.
      this.contactForm.get('password')?.valueChanges.subscribe(value => {
        const passwordAgainControl = this.contactForm.get('passwordAgain');
        if (value) {
          passwordAgainControl?.setValidators([Validators.required, Validators.minLength(8)]);
        } else {
          passwordAgainControl?.clearValidators();
        }
        passwordAgainControl?.updateValueAndValidity();
      });
       this.contactForm.get('password')?.clearValidators();
       this.contactForm.get('password')?.setValidators([Validators.minLength(8)]); // MinLength if provided
       this.contactForm.get('password')?.updateValueAndValidity();
       this.contactForm.get('passwordAgain')?.clearValidators();
       this.contactForm.get('passwordAgain')?.updateValueAndValidity();
    }
  }

  editContact(contact: Contact): void {
    this.submissionMessage = null;
    this.initializeForm(contact);
  }

  get f() { return this.contactForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.submissionMessage = null;

    if (this.contactForm.invalid) {
      // Check if the only error is passwordsMismatch on passwordAgain when password is empty (for edit mode)
      const passwordControl = this.contactForm.get('password');
      const passwordAgainControl = this.contactForm.get('passwordAgain');
      if (this.editMode && !passwordControl?.value && passwordAgainControl?.hasError('passwordsMismatch')) {
        // This specific case can be ignored if password is not being changed
      } else {
        return;
      }
    }

    let result;
    const formValue = this.contactForm.value;

    if (this.editMode && this.editingContact) {
      const updatedContact: Contact = {
        ...this.editingContact, 
        username: formValue.username,
        email: formValue.email,
        address: formValue.address,
        phone: formValue.phone || undefined,
        comment: formValue.comment || undefined,
        // Password is only updated if a new password is provided
        // The storage service handles keeping the old one if formValue.password is empty/undefined
        password: formValue.password || undefined 
      };
      result = this.storageService.update(updatedContact);
    } else {
      // For new contact, password is required by form validators
      const contactToSave: Omit<Contact, 'createdAt'> = {
        username: formValue.username,
        email: formValue.email,
        password: formValue.password, // Will be encoded by service
        address: formValue.address,
        phone: formValue.phone || undefined,
        comment: formValue.comment || undefined,
      };
      result = this.storageService.save(contactToSave);
    }

    if (result.success) {
      this.submissionMessage = this.editMode ? 'Contact updated successfully!' : 'Contact saved successfully!';
      this.resetForm();
      this.contactModified.emit(); // Emit event here
    } else {
      this.submissionMessage = result.error || 'An unknown error occurred.';
    }
  }

  resetForm(): void {
    const wasEditMode = this.editMode;
    this.contactForm.reset();
    this.submitted = false;
    this.submissionMessage = null;
    this.editMode = false;
    this.editingContact = null;
    
    // Re-apply initial validators
    this.contactForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.contactForm.get('password')?.updateValueAndValidity();
    this.contactForm.get('passwordAgain')?.setValidators([Validators.required]);
    this.contactForm.get('passwordAgain')?.updateValueAndValidity();

    // If it *was* edit mode and now it's reset to a new form, ensure password is required
    // If it was reset *from* edit mode (e.g. cancel edit), it needs to be a "new form" state
    // The initializeForm call with no args effectively does this, but let's be explicit for password
    if (wasEditMode) {
        this.initializeForm(); // Re-initialize to non-edit state
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }
}
