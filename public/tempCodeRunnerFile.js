// DOM Elements
const calendarMonth = document.getElementById('calendar-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const calendarDates = document.getElementById('calendar-dates');
const scheduleTableContainer = document.getElementById('schedule-table-container');
const scheduleTableBody = document.querySelector('#schedule-table tbody'); // Schedule table body

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let scheduledClasses = []; // Store scheduled classes by specific date

// Render Calendar Function
function renderCalendar(month, year) {
    const firstDay = new Date(year, month, 1).getDay(); // Day of the week of the first date
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total days in the current month

    // Update Month and Year Display
    calendarMonth.innerText = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    // Clear previous dates
    calendarDates.innerHTML = '';

    // Fill blank spaces for days before the first day of the current month
    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement('div');
        calendarDates.appendChild(blank);
    }

    // Populate the days of the month and mark scheduled days
    for (let date = 1; date <= daysInMonth; date++) {
        const dateElem = document.createElement('div');
        dateElem.innerText = date;
        dateElem.classList.add('date');
        
        // Highlight scheduled days (for specific dates, not just day of week)
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        if (scheduledClasses.includes(dateStr)) {
            dateElem.classList.add('scheduled'); // Add custom class for scheduled days
        }

        dateElem.addEventListener('click', () => {
            // Remove active class from all dates
            document.querySelectorAll('.date').forEach(d => d.classList.remove('active'));
            // Add active class to the selected date
            dateElem.classList.add('active');

            // Show schedule for this day
            showScheduleForDate(dateStr);
        });

        calendarDates.appendChild(dateElem);
    }
}

// Function to populate schedule table with data
function populateScheduleTable(scheduleData) {
    const tableBody = document.querySelector('#scheduleTable tbody');
    tableBody.innerHTML = ''; // Clear any existing rows

    scheduleData.forEach((item) => {
        const row = `
            <tr>
                <td>${item.year}</td>
                <td>${item.department}</td>
                <td>${item.section}</td>
                <td>${item.timing}</td>
                <td>${item.subject_name}</td>
                <td>${item.faculty}</td>
                <td>${item.room_no}</td>
                <td>${item.day}</td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

// Navigation Buttons
prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});

// Initialize Calendar
renderCalendar(currentMonth, currentYear);

// Handle Form Submission for Class Scheduling
const classScheduleForm = document.getElementById('class-schedule-form');

classScheduleForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent form from reloading the page

    // Gather form data
    const year = document.getElementById('year').value;
    const department = document.getElementById('department').value;
    const section = document.getElementById('section').value;
    const timing = document.getElementById('timing').value;
    const day = document.getElementById('day').value; // Expecting day as a date (YYYY-MM-DD)

    // Create the schedule object
    const schedule = {
        year,
        department,
        section,
        timing,
        day,
    };

    try {
        // Send data to the backend to add the schedule
        const response = await fetch('http://localhost:5000/addSchedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(schedule),
        });

        const result = await response.json();
        if (response.ok) {
            alert('Schedule added successfully!');

            // After successful schedule addition, add the new scheduled class
            if (!scheduledClasses.includes(day)) {
                scheduledClasses.push(day); // Add the day to the scheduled classes list
            }
            renderCalendar(currentMonth, currentYear); // Re-render the calendar with updated schedule
        } else {
            alert('Failed to add schedule: ' + result.error);
        }
    } catch (error) {
        console.error('Error adding schedule:', error);
        alert('Error connecting to the server.');
    }
});

// Show Schedule for Specific Date
async function showScheduleForDate(dateStr) {
    try {
        // Send request to fetch schedule for the selected date
        const response = await fetch(`http://localhost:5000/getSchedule?date=${dateStr}`);
        const data = await response.json();

        if (response.ok) {
            const scheduleData = data.schedule || [];
            scheduleTableBody.innerHTML = ''; // Clear previous data

            if (scheduleData.length > 0) {
                // Populate schedule table with fetched data
                populateScheduleTable(scheduleData);

                // Display the schedule table container
                scheduleTableContainer.style.display = 'block';
            } else {
                alert('No schedule found for the selected date.');
            }
        } else {
            alert('Failed to fetch schedule: ' + data.error);
        }
    } catch (error) {
        console.error('Error fetching schedule:', error);
        alert('Error connecting to the server.');
    }
}

// Search and View Schedule for Specific Criteria
document.getElementById('view-schedule-btn').addEventListener('click', function() {
    // Get the selected values from the form
    const year = document.getElementById('year').value;
    const department = document.getElementById('department').value;
    const section = document.getElementById('section').value;
    const day = document.getElementById('day').value;

    // Make the API request to get the schedule
    fetch(`http://localhost:5000/getSchedule?year=${encodeURIComponent(year)}&department=${encodeURIComponent(department)}&section=${encodeURIComponent(section)}&day=${encodeURIComponent(day)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                // Clear the existing table data
                const tbody = document.querySelector('#scheduleTable tbody');
                tbody.innerHTML = '';

                // Populate the table with the fetched schedule
                data.schedule.forEach(schedule => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${schedule.year}</td>
                        <td>${schedule.department}</td>
                        <td>${schedule.section}</td>
                        <td>${schedule.timing}</td>
                        <td>${schedule.subject}</td>
                        <td>${schedule.faculty}</td>
                        <td>${schedule.room_no}</td>
                        <td>${schedule.day}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching schedule:', error);
            alert('Failed to fetch schedule. Please try again later.');
        });
});

// Optional functions for alerts (like login, about, etc.)
function viewSchedule() {
    alert('Schedule Viewed Successfully!');
}

function login() {
    alert('Redirecting to login...');
}

function about() {
    alert('Gokaraju Rangaraju College of Engineering and Technology!');
}
