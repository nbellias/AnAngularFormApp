import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService, Contact } from '../storage.service';

@Component({
  selector: 'app-contact-table',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './contact-table.component.html',
  styleUrls: ['./contact-table.component.css']
})
export class ContactTableComponent implements OnInit {
  @Output() editContactRequest = new EventEmitter<Contact>();
  // deleteContactRequest is not needed if delete is handled internally

  contacts: Contact[] = [];
  processedContacts: Contact[] = []; // Holds sorted contacts before pagination
  displayContacts: Contact[] = [];   // Holds contacts for the current page
  isVisible = false;

  sortColumn: keyof Contact | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  searchTerm = '';

  userMessage: { text: string, type: 'success' | 'error' } | null = null;

  constructor(private storageService: StorageService) { }

  ngOnInit(): void {
    // Initial load can be deferred until table is shown or handled here
    // For simplicity, we load and prepare data if table starts visible or becomes visible.
  }

  loadContacts(): void {
    this.contacts = this.storageService.getAll();
    this.currentPage = 1; // Reset to first page on load
    this.applyFiltersAndSorting(); 
  }

  onSearchTermChanged(): void {
    this.currentPage = 1; // Reset to first page on search
    this.applyFiltersAndSorting();
  }

  toggleTable(): void {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.loadContacts();
    }
  }

  sortData(column: keyof Contact): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1; // Reset to first page on sort
    this.applyFiltersAndSorting();
  }

  applyFiltersAndSorting(): void {
    let contactsToProcess = [...this.contacts];

    // Filtering
    if (this.searchTerm.trim()) {
      const lowerSearchTerm = this.searchTerm.toLowerCase().trim();
      contactsToProcess = contactsToProcess.filter(contact => {
        return (
          contact.username.toLowerCase().includes(lowerSearchTerm) ||
          contact.email.toLowerCase().includes(lowerSearchTerm) ||
          contact.address.toLowerCase().includes(lowerSearchTerm) ||
          (contact.phone && contact.phone.toLowerCase().includes(lowerSearchTerm)) ||
          (contact.comment && contact.comment.toLowerCase().includes(lowerSearchTerm)) ||
          new Date(contact.createdAt).toLocaleDateString().toLowerCase().includes(lowerSearchTerm) || 
          new Date(contact.createdAt).toLocaleTimeString().toLowerCase().includes(lowerSearchTerm)
        );
      });
    }

    // Sorting
    const columnToSort = this.sortColumn;
    if (columnToSort) {
      contactsToProcess.sort((a, b) => {
        const valA = a[columnToSort];
        const valB = b[columnToSort];
        let comparison = 0;
        if (valA == null && valB == null) comparison = 0;
        else if (valA == null) comparison = this.sortDirection === 'asc' ? -1 : 1;
        else if (valB == null) comparison = this.sortDirection === 'asc' ? 1 : -1;
        else if (valA < valB) comparison = -1;
        else if (valA > valB) comparison = 1;
        return this.sortDirection === 'asc' ? comparison : comparison * -1;
      });
    }
    this.processedContacts = contactsToProcess;
    this.applyPagination();
  }

  applyPagination(): void {
    this.totalPages = Math.ceil(this.processedContacts.length / this.itemsPerPage);
    if (this.totalPages === 0) {
        this.currentPage = 0; // Or 1, depending on desired display for no items
    } else if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
    } else if (this.currentPage < 1 && this.totalPages > 0) {
        this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayContacts = this.processedContacts.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyPagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  getPageNumbers(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  onEdit(contact: Contact): void {
    this.editContactRequest.emit(contact);
  }

  onDelete(contact: Contact): void {
    if (window.confirm(`Are you sure you want to delete ${contact.username}? This action cannot be undone.`)) {
      const result = this.storageService.delete(contact.createdAt);
      if (result.success) {
        this.userMessage = { text: `'${contact.username}' deleted successfully.`, type: 'success' };
        this.loadContacts(); // Refresh table
      } else {
        this.userMessage = { text: result.error || 'Error deleting contact.', type: 'error' };
      }
      setTimeout(() => this.userMessage = null, 5000); // Clear message after 5 seconds
    }
  }

  clearAllContacts(): void {
    if (window.confirm('Are you sure you want to delete all contacts? This action cannot be undone.')) {
      this.storageService.clearAll();
      this.searchTerm = '';
      this.loadContacts();
      this.userMessage = { text: 'All contacts cleared successfully.', type: 'success' };
      setTimeout(() => this.userMessage = null, 5000); // Clear message after 5 seconds
    }
  }

  private generateFilename(extension: 'csv' | 'json'): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `contacts_${year}${month}${day}_${hours}${minutes}${seconds}.${extension}`;
  }

  exportData(format: 'csv' | 'json'): void {
    const allContacts = this.storageService.getAll(); 
    if (allContacts.length === 0) {
      alert('No contacts to export.');
      return;
    }

    let dataStr = '';
    let mimeType = '';
    const filename = this.generateFilename(format);

    if (format === 'json') {
      dataStr = JSON.stringify(allContacts, null, 2);
      mimeType = 'application/json';
    } else if (format === 'csv') {
      let csvContent = '';
      const headers = ['Username', 'Email', 'Address', 'Phone', 'Comment', 'CreatedAt'];
      csvContent += headers.join(',') + '\r\n';

      allContacts.forEach(contact => {
        const row = [
          `"${contact.username.replace(/"/g, '""')}"`, 
          `"${contact.email.replace(/"/g, '""')}"`, 
          `"${contact.address.replace(/"/g, '""')}"`, 
          `"${(contact.phone || '').replace(/"/g, '""')}"`, 
          `"${(contact.comment || '').replace(/"/g, '""')}"`, 
          `"${new Date(contact.createdAt).toISOString()}"`
        ];
        csvContent += row.join(',') + '\r\n';
      });
      dataStr = csvContent;
      mimeType = 'text/csv';
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}