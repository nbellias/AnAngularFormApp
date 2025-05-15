import { Component, ViewChild, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { ContactTableComponent } from './contact-table/contact-table.component';
import { Contact, StorageService } from './storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ContactFormComponent, ContactTableComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AnAngularFormApp';
  currentTheme: 'light' | 'dark' = 'light';

  @ViewChild(ContactFormComponent) contactFormComp!: ContactFormComponent;
  @ViewChild(ContactTableComponent) contactTableComp!: ContactTableComponent;

  constructor(
    private storageService: StorageService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    const savedTheme = this.storageService.getThemePreference();
    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else {
      // Optional: Detect system preference if no theme is saved
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme = prefersDark ? 'dark' : 'light';
    }
    this.applyTheme();
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.storageService.saveThemePreference(this.currentTheme);
    this.applyTheme();
  }

  private applyTheme(): void {
    this.renderer.setAttribute(this.document.documentElement, 'data-bs-theme', this.currentTheme);
  }

  handleEditContact(contact: Contact): void {
    if (this.contactFormComp) {
      this.contactFormComp.editContact(contact);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  refreshContactTable(): void {
    if (this.contactTableComp) {
      this.contactTableComp.loadContacts();
    }
  }
}
