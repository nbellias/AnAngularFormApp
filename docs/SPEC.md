# **Contact-Me Web Application Specification**  
**Version**: 1.2  
**Technology Stack**: Angular 19.0, TypeScript, Signals, Angular Bootstrap, Local Storage  

---

## **1. Overview**  
A responsive web app to submit, manage, and export contact details with dark/light mode support.  

### **Core Features**  
✔ Form validation + password masking  
✔ LocalStorage persistence (prevents duplicates)  
✔ Toggleable table (sort/filter/pagination)  
✔ Edit/delete contacts  
✔ Export to CSV/JSON (timestamps in filenames)  
✔ Dark/light mode toggle (Bootstrap defaults)  
✔ Timestamps for all contacts  
✔ Accessibility (ARIA, keyboard nav)  

---

## **2. Functional Requirements**  

### **2.1 Form Fields**  
| Field           | Validation Rules                         |  
|-----------------|------------------------------------------|  
| Username        | Required, min 3 chars                    |  
| Password        | Required, min 8 chars, masked            | 
| Email           | Required, valid format                   |  
| Address         | Required, min 10 chars                   | 
| Phone           | Optional, validation if provided         | 
| Comment         | Optional, no validation if provided      | 
|-----------------|------------------------------------------|

### **2.2 Actions**  
- **Submit**: Saves contact with `createdAt` timestamp in the localStorage.  
- **Reset**: Clears form.  
- **Toggle Table**: Shows/hides contacts.  
- **Export**: Generates `contacts_YYYYMMDD_HHMMSS.csv/json`.  
- **Clear All**: Deletes all contacts.  

### **2.3 Data Table**  
- **Columns**: Username, Email, Address, Phone, Created At  
- **Features**: Sorting, filtering, pagination, edit/delete per row.  

---

## **3. Technical Design**  

### **3.1 Data Structure**  
```typescript
interface Contact {
  username: string;
  email: string;
  createdAt: string; // ISO timestamp
  // ... other fields
}