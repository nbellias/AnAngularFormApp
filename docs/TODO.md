# **Contact-Me App: Implementation Roadmap**  

## **Phase 1: Core Form & LocalStorage**  
**Objective**: Basic form submission with validation and LocalStorage persistence.  

### ✅ **1. Set Up Angular 19 Project**  
- [ ] `ng new contact-me-app --standalone`  
- [ ] Install Angular Bootstrap (`ng add @ng-bootstrap/ng-bootstrap`)  
**Acceptance Criteria**:  
- Project runs with `ng serve` without errors.  
- Bootstrap CSS is loaded.  

### ✅ **2. Create Contact Form Component**  
- [ ] Add reactive form with fields (username, email, password, etc.).  
- [ ] Implement validation (required, email format, password match).  
**Acceptance Criteria**:  
- Form shows error messages for invalid fields.  
- Submit button disabled until valid.  

### ✅ **3. LocalStorage Service**  
- [ ] Create `StorageService` with `save()`, `getAll()`, `clearAll()`.  
- [ ] Prevent duplicates (check `email`/`username`).  
**Acceptance Criteria**:  
- Data persists after page reload.  
- Duplicates trigger error message.  

---

## **Phase 2: Table & Basic Interactions**  
**Objective**: Display and manage contacts in a toggleable table.  

### ✅ **4. Toggleable Table Component**  
- [ ] Add table with columns: Username, Email, Address, Phone.  
- [ ] Add "Show/Hide Table" button.  
**Acceptance Criteria**:  
- Table appears/disappears on button click.  
- Displays all saved contacts.  

### ✅ **5. Reset & Clear All**  
- [ ] Implement "Reset Form" button.  
- [ ] Add "Clear All Contacts" button.  
**Acceptance Criteria**:  
- Reset clears form fields.  
- Clear All removes all data from LocalStorage.  

---

## **Phase 3: Advanced Table Features**  
**Objective**: Enhance table with sorting, filtering, and pagination.  

### ✅ **6. Table Sorting & Pagination**  
- [ ] Add sorting (asc/desc) to each column.  
- [ ] Implement pagination (10 items/page).  
**Acceptance Criteria**:  
- Clicking column headers sorts data.  
- Pagination controls work.  

### ✅ **7. Search Filter**  
- [ ] Add search input to filter by any field.  
**Acceptance Criteria**:  
- Typing in search box updates table in real-time.  

---

## **Phase 4: Edit/Delete & Timestamps**  
**Objective**: Modify existing contacts and track creation time.  

### ✅ **8. Edit/Delete Contacts**  
- [ ] Add "Edit" button (loads data into form).  
- [ ] Add "Delete" button (with confirmation dialog).  
**Acceptance Criteria**:  
- Editing updates existing records.  
- Deleting removes the contact.  

### ✅ **9. Add Timestamps**  
- [ ] Add `createdAt` field to all contacts (ISO format).  
- [ ] Display in table column.  
**Acceptance Criteria**:  
- New submissions include timestamp.  
- Table shows "Created At" column.  

---

## **Phase 5: Export & Themes**  
**Objective**: Add data export and dark/light mode.  

### ✅ **10. Export to CSV/JSON**  
- [ ] Add buttons to export table data.  
- [ ] Filename format: `contacts_YYYYMMDD_HHMMSS.csv/json`.  
**Acceptance Criteria**:  
- Files download with correct data and timestamped names.  

### ✅ **11. Dark/Light Mode Toggle**  
- [ ] Add theme switch using Bootstrap’s `data-bs-theme`.  
- [ ] Persist preference in LocalStorage.  
**Acceptance Criteria**:  
- Toggle switches themes instantly.  
- Preference survives page reload.  

---

## **Phase 6: Polish & Accessibility**  
**Objective**: Final touches for usability.  

### ✅ **12. Confirmation Messages**  
- [ ] Add toasts/alerts for "Contact saved", "Cleared all", etc.  
**Acceptance Criteria**:  
- User gets feedback after key actions.  

### ✅ **13. Accessibility**  
- [ ] Add ARIA labels to form/table.  
- [ ] Ensure keyboard navigation works.  
**Acceptance Criteria**:  
- Screen reader compatibility verified.  
- All actions keyboard-accessible.  
