import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StorageService, Contact } from '../storage.service';

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
      password: ['', [Validators.required, Validators.minLength(8)]], // Password always blank for edit, not pre-filled
      address: [contactToEdit?.address || '', [Validators.required, Validators.minLength(10)]],
      phone: [contactToEdit?.phone || '', [Validators.pattern('^[+]?[0-9]{10,13}$')]],
      comment: [contactToEdit?.comment || '']
    });
    // If editing, password validation might not be strictly required or could be optional
    // For now, keeping it required. Could be adjusted based on exact UX needs.
    if (this.editMode) {
        this.contactForm.get('password')?.clearValidators();
        this.contactForm.get('password')?.updateValueAndValidity();
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
      return;
    }

    let result;
    const formValue = this.contactForm.value;

    if (this.editMode && this.editingContact) {
      const updatedContact: Contact = {
        ...this.editingContact, // Retain original createdAt and other non-form fields
        username: formValue.username,
        email: formValue.email,
        address: formValue.address,
        phone: formValue.phone || undefined, // Ensure optional fields are undefined if empty
        comment: formValue.comment || undefined,
      };
      // If password field has a value, include it, otherwise don't send password for update if blank
      if (formValue.password) {
        updatedContact.password = formValue.password;
      }
      result = this.storageService.update(updatedContact);
    } else {
      result = this.storageService.save(formValue);
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
    this.contactForm.reset();
    this.submitted = false;
    this.submissionMessage = null;
    this.editMode = false;
    this.editingContact = null;
    // Re-apply password validators if they were cleared
    this.contactForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.contactForm.get('password')?.updateValueAndValidity();
  }

  cancelEdit(): void {
    this.resetForm();
  }
}
