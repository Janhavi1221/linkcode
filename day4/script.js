// Student Management System JavaScript
class StudentManagementSystem {
    constructor() {
        this.students = this.loadStudents();
        this.editingStudentId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderStudents();
        this.updateStatistics();
    }

    // Load students from localStorage
    loadStudents() {
        const stored = localStorage.getItem('students');
        return stored ? JSON.parse(stored) : [];
    }

    // Save students to localStorage
    saveStudents() {
        localStorage.setItem('students', JSON.stringify(this.students));
    }

    // Bind event listeners
    bindEvents() {
        // Form submission
        document.getElementById('studentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.resetForm();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterStudents();
        });

        // Filter functionality
        document.getElementById('courseFilter').addEventListener('change', () => {
            this.filterStudents();
        });

        document.getElementById('semesterFilter').addEventListener('change', () => {
            this.filterStudents();
        });

        // Export functionality
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportStudents();
        });

        // Import functionality
        document.getElementById('importBtn').addEventListener('click', () => {
            this.importStudents();
        });

        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Modal confirm buttons
        document.getElementById('confirmYes').addEventListener('click', () => {
            this.confirmAction();
        });

        document.getElementById('confirmNo').addEventListener('click', () => {
            this.closeModal();
        });

        // Click outside modal to close
        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmModal') {
                this.closeModal();
            }
        });

        // Form validation on input
        const inputs = document.querySelectorAll('#studentForm input, #studentForm select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
    }

    // Validate individual field
    validateField(field) {
        const errorMessage = field.parentElement.querySelector('.error-message');
        let isValid = true;

        // Remove previous error state
        field.classList.remove('error');
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }

        // Required field validation
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            this.showFieldError(field, 'This field is required');
        }

        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                this.showFieldError(field, 'Please enter a valid email address');
            }
        }

        // Phone validation
        if (field.name === 'phone' && field.value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(field.value) || field.value.length < 10) {
                isValid = false;
                this.showFieldError(field, 'Please enter a valid phone number');
            }
        }

        // Roll number validation
        if (field.name === 'rollNumber' && field.value) {
            const existingStudent = this.students.find(s => 
                s.rollNumber === field.value && s.id !== this.editingStudentId
            );
            if (existingStudent) {
                isValid = false;
                this.showFieldError(field, 'Roll number already exists');
            }
        }

        // Semester validation
        if (field.name === 'semester' && field.value) {
            const semester = parseInt(field.value);
            if (semester < 1 || semester > 8) {
                isValid = false;
                this.showFieldError(field, 'Semester must be between 1 and 8');
            }
        }

        // Percentage validation
        if (field.name === 'percentage' && field.value) {
            const percentage = parseFloat(field.value);
            if (percentage < 0 || percentage > 100) {
                isValid = false;
                this.showFieldError(field, 'Percentage must be between 0 and 100');
            }
        }

        return isValid;
    }

    // Show field error
    showFieldError(field, message) {
        field.classList.add('error');
        const errorMessage = field.parentElement.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }

    // Validate entire form
    validateForm() {
        const inputs = document.querySelectorAll('#studentForm input, #studentForm select');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Handle form submission
    handleFormSubmit() {
        if (!this.validateForm()) {
            this.showMessage('Please fix the errors in the form', 'error');
            return;
        }

        const formData = new FormData(document.getElementById('studentForm'));
        const student = {
            id: this.editingStudentId || Date.now().toString(),
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            email: formData.get('email').trim(),
            phone: formData.get('phone').trim(),
            rollNumber: formData.get('rollNumber').trim(),
            course: formData.get('course'),
            semester: parseInt(formData.get('semester')),
            percentage: formData.get('percentage') ? parseFloat(formData.get('percentage')) : null
        };

        if (this.editingStudentId) {
            // Update existing student
            const index = this.students.findIndex(s => s.id === this.editingStudentId);
            if (index !== -1) {
                this.students[index] = student;
                this.showMessage('Student updated successfully!', 'success');
            }
        } else {
            // Add new student
            this.students.push(student);
            this.showMessage('Student added successfully!', 'success');
        }

        this.saveStudents();
        this.renderStudents();
        this.updateStatistics();
        this.resetForm();
    }

    // Reset form
    resetForm() {
        document.getElementById('studentForm').reset();
        this.editingStudentId = null;
        document.getElementById('formTitle').innerHTML = '<i class="fas fa-user-plus"></i> Add New Student';
        document.getElementById('submitBtnText').textContent = 'Add Student';
        
        // Clear all error states
        document.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.style.display = 'none';
        });
    }

    // Edit student
    editStudent(id) {
        const student = this.students.find(s => s.id === id);
        if (!student) return;

        this.editingStudentId = id;
        
        // Populate form
        document.getElementById('firstName').value = student.firstName;
        document.getElementById('lastName').value = student.lastName;
        document.getElementById('email').value = student.email;
        document.getElementById('phone').value = student.phone;
        document.getElementById('rollNumber').value = student.rollNumber;
        document.getElementById('course').value = student.course;
        document.getElementById('semester').value = student.semester;
        document.getElementById('percentage').value = student.percentage || '';

        // Update form title and button
        document.getElementById('formTitle').innerHTML = '<i class="fas fa-user-edit"></i> Edit Student';
        document.getElementById('submitBtnText').textContent = 'Update Student';

        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        
        // Focus first field
        document.getElementById('firstName').focus();
    }

    // Delete student
    deleteStudent(id) {
        this.pendingAction = () => {
            const index = this.students.findIndex(s => s.id === id);
            if (index !== -1) {
                this.students.splice(index, 1);
                this.saveStudents();
                this.renderStudents();
                this.updateStatistics();
                this.showMessage('Student deleted successfully!', 'success');
            }
        };

        this.showConfirmModal('Are you sure you want to delete this student? This action cannot be undone.');
    }

    // Filter students
    filterStudents() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const courseFilter = document.getElementById('courseFilter').value;
        const semesterFilter = document.getElementById('semesterFilter').value;

        const filteredStudents = this.students.filter(student => {
            const matchesSearch = !searchTerm || 
                student.firstName.toLowerCase().includes(searchTerm) ||
                student.lastName.toLowerCase().includes(searchTerm) ||
                student.email.toLowerCase().includes(searchTerm) ||
                student.rollNumber.toLowerCase().includes(searchTerm);

            const matchesCourse = !courseFilter || student.course === courseFilter;
            const matchesSemester = !semesterFilter || student.semester.toString() === semesterFilter;

            return matchesSearch && matchesCourse && matchesSemester;
        });

        this.renderFilteredStudents(filteredStudents);
    }

    // Render filtered students
    renderFilteredStudents(students) {
        const tbody = document.getElementById('studentsTableBody');
        const noRecords = document.getElementById('noRecords');

        if (students.length === 0) {
            tbody.innerHTML = '';
            noRecords.style.display = 'block';
            return;
        }

        noRecords.style.display = 'none';
        tbody.innerHTML = students.map(student => this.createStudentRow(student)).join('');
    }

    // Render all students
    renderStudents() {
        this.filterStudents();
    }

    // Create student row HTML
    createStudentRow(student) {
        return `
            <tr>
                <td>${student.id}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.email}</td>
                <td>${student.phone}</td>
                <td>${student.rollNumber}</td>
                <td>${student.course}</td>
                <td>Semester ${student.semester}</td>
                <td>${student.percentage ? student.percentage.toFixed(2) + '%' : 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="studentSystem.editStudent('${student.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete-btn" onclick="studentSystem.deleteStudent('${student.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Update statistics
    updateStatistics() {
        const totalStudents = this.students.length;
        const uniqueCourses = [...new Set(this.students.map(s => s.course))].length;
        const avgPercentage = this.students
            .filter(s => s.percentage !== null && s.percentage !== undefined)
            .reduce((sum, s, _, arr) => sum + s.percentage / arr.length, 0);

        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('totalCourses').textContent = uniqueCourses;
        document.getElementById('avgPercentage').textContent = avgPercentage.toFixed(2) + '%';
    }

    // Export students
    exportStudents() {
        if (this.students.length === 0) {
            this.showMessage('No students to export', 'warning');
            return;
        }

        const csv = this.convertToCSV(this.students);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showMessage('Students exported successfully!', 'success');
    }

    // Convert students to CSV
    convertToCSV(students) {
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Roll Number', 'Course', 'Semester', 'Percentage'];
        const csvContent = [
            headers.join(','),
            ...students.map(student => [
                student.id,
                student.firstName,
                student.lastName,
                student.email,
                student.phone,
                student.rollNumber,
                student.course,
                student.semester,
                student.percentage || ''
            ].map(field => `"${field}"`).join(','))
        ].join('\n');

        return csvContent;
    }

    // Import students
    importStudents() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const csv = event.target.result;
                    const students = this.parseCSV(csv);
                    
                    if (students.length > 0) {
                        this.students = [...this.students, ...students];
                        this.saveStudents();
                        this.renderStudents();
                        this.updateStatistics();
                        this.showMessage(`${students.length} students imported successfully!`, 'success');
                    } else {
                        this.showMessage('No valid students found in the CSV file', 'warning');
                    }
                } catch (error) {
                    this.showMessage('Error importing students: ' + error.message, 'error');
                }
            };
            
            reader.readAsText(file);
        });

        input.click();
    }

    // Parse CSV
    parseCSV(csv) {
        const lines = csv.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const students = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            
            if (values.length >= headers.length) {
                const student = {
                    id: Date.now().toString() + i,
                    firstName: values[1] || '',
                    lastName: values[2] || '',
                    email: values[3] || '',
                    phone: values[4] || '',
                    rollNumber: values[5] || '',
                    course: values[6] || '',
                    semester: parseInt(values[7]) || 1,
                    percentage: values[8] ? parseFloat(values[8]) : null
                };

                // Basic validation
                if (student.firstName && student.lastName && student.email) {
                    students.push(student);
                }
            }
        }

        return students;
    }

    // Show confirmation modal
    showConfirmModal(message) {
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'block';
    }

    // Close modal
    closeModal() {
        document.getElementById('confirmModal').style.display = 'none';
        this.pendingAction = null;
    }

    // Confirm action
    confirmAction() {
        if (this.pendingAction) {
            this.pendingAction();
            this.pendingAction = null;
        }
        this.closeModal();
    }

    // Show message
    showMessage(message, type = 'success') {
        const container = document.getElementById('messageContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 
                    'info-circle';
        
        messageDiv.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studentSystem = new StudentManagementSystem();
});

// Add some sample data for demonstration (optional)
function addSampleData() {
    const sampleStudents = [
        {
            id: Date.now().toString() + '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '123-456-7890',
            rollNumber: 'CS001',
            course: 'Computer Science',
            semester: 3,
            percentage: 85.5
        },
        {
            id: Date.now().toString() + '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '098-765-4321',
            rollNumber: 'ENG002',
            course: 'Engineering',
            semester: 5,
            percentage: 78.2
        },
        {
            id: Date.now().toString() + '3',
            firstName: 'Mike',
            lastName: 'Johnson',
            email: 'mike.johnson@example.com',
            phone: '555-123-4567',
            rollNumber: 'BUS003',
            course: 'Business',
            semester: 2,
            percentage: 72.8
        }
    ];

    if (window.studentSystem.students.length === 0) {
        window.studentSystem.students = sampleStudents;
        window.studentSystem.saveStudents();
        window.studentSystem.renderStudents();
        window.studentSystem.updateStatistics();
        window.studentSystem.showMessage('Sample data added for demonstration', 'success');
    }
}

// Uncomment the line below to add sample data automatically
// setTimeout(addSampleData, 1000);
