import { Injectable } from '@angular/core';

export interface Contact {
  username: string;
  email: string;
  password?: string; // Password will now be stored (encoded)
  address: string;
  phone?: string;
  comment?: string;
  createdAt: string; // ISO timestamp
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly CONTACTS_STORAGE_KEY = 'contacts';
  private readonly THEME_STORAGE_KEY = 'themePreference'; // New key for theme

  constructor() { }

  private getContacts(): Contact[] {
    const contactsJson = localStorage.getItem(this.CONTACTS_STORAGE_KEY);
    return contactsJson ? JSON.parse(contactsJson) : [];
  }

  private saveContacts(contacts: Contact[]): void {
    localStorage.setItem(this.CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  }

  save(contactData: Omit<Contact, 'createdAt'>): { success: boolean; error?: string } {
    const contacts = this.getContacts();

    if (contacts.some(c => c.email === contactData.email || c.username === contactData.username)) {
      return { success: false, error: 'Duplicate email or username.' };
    }

    const newContact: Contact = {
      ...contactData,
      // Encode password if provided
      password: contactData.password ? btoa(contactData.password) : undefined,
      createdAt: new Date().toISOString()
    };
    
    // const { password, ...contactToSave } = newContact; // Password is now part of contactToSave
    contacts.push(newContact); // newContact already has password potentially encoded
    this.saveContacts(contacts);
    return { success: true };
  }

  update(updatedContactData: Contact): { success: boolean; error?: string } {
    let contacts = this.getContacts();
    const index = contacts.findIndex(c => c.createdAt === updatedContactData.createdAt);

    if (index === -1) {
      return { success: false, error: 'Contact not found for update.' };
    }

    // Check for duplicates, excluding the contact being updated from the check
    if (contacts.some(c => 
        (c.email === updatedContactData.email || c.username === updatedContactData.username) && 
        c.createdAt !== updatedContactData.createdAt
    )) {
      return { success: false, error: 'Update would cause a duplicate email or username.' };
    }
    
    const existingContact = contacts[index];
    let passwordToStore: string | undefined;

    if (updatedContactData.password && updatedContactData.password.trim() !== '') {
      // New password provided, encode it
      passwordToStore = btoa(updatedContactData.password);
    } else {
      // No new password provided, keep the existing one
      passwordToStore = existingContact.password;
    }

    contacts[index] = {
      ...updatedContactData,
      password: passwordToStore
    };
    
    this.saveContacts(contacts);
    return { success: true };
  }

  delete(createdAtTimestamp: string): { success: boolean; error?: string } {
    let contacts = this.getContacts();
    const initialLength = contacts.length;
    contacts = contacts.filter(c => c.createdAt !== createdAtTimestamp);

    if (contacts.length === initialLength) {
      return { success: false, error: 'Contact not found for deletion.' };
    }

    this.saveContacts(contacts);
    return { success: true };
  }

  getAll(): Contact[] {
    return this.getContacts();
  }

  clearAll(): void {
    localStorage.removeItem(this.CONTACTS_STORAGE_KEY);
  }

  // --- Theme methods --- 
  saveThemePreference(theme: 'light' | 'dark'): void {
    localStorage.setItem(this.THEME_STORAGE_KEY, theme);
  }

  getThemePreference(): 'light' | 'dark' | null {
    return localStorage.getItem(this.THEME_STORAGE_KEY) as 'light' | 'dark' | null;
  }
}
