// DOM Elements
const calendarMonth = document.getElementById('calendar-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const calendarDates = document.getElementById('calendar-dates');
const scheduleTableContainer = document.getElementById('schedule-table-container'); // Ensure this exists in your HTML
const scheduleTableBody = document.querySelector('#scheduleTable tbody'); // Schedule table body

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let scheduledClasses = []; // Store scheduled classes by specific date

// Render Calendar Function
function renderCalendar(month, year) {
    const firstDay = new Date(year, month, 1).getDay(); // Day of the week of the first date
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total days in the current month
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Update Month and Year Display
    calendarMonth.innerText = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    // Clear previous dates
    calendarDates.innerHTML = '';

    // Fill blank spaces for days before the first day of the current month
    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement('div');
        blank.classList.add('empty'); // Add a class for styling if needed
        calendarDates.appendChild(blank);
    }

    // Populate the days of the month and mark scheduled days
    for (let date = 1; date <= daysInMonth; date++) {
        const dateElem = document.createElement('div');
        dateElem.innerText = date;
        dateElem.classList.add('date');

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

        // Highlight today's date
        if (dateStr === todayStr) {
            dateElem.classList.add('today');
        }

        // Highlight scheduled days
        if (scheduledClasses.includes(dateStr)) {
            dateElem.classList.add('scheduled');
        }

        // Add click event to show schedule for the selected date
        dateElem.addEventListener('click', () => {
            document.querySelectorAll('.date').forEach(d => d.classList.remove('active'));
            dateElem.classList.add('active');
            showScheduleForDate(dateStr);
        });

        calendarDates.appendChild(dateElem);
    }
}

// Function to populate schedule table with data
function populateScheduleTable(scheduleData) {
    scheduleTableBody.innerHTML = ''; // Clear any existing rows

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
        scheduleTableBody.insertAdjacentHTML('beforeend', row);
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
        const response = await fetch('https://college-schedule.vercel.app/addSchedule', {
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
// async function showScheduleForDate(dateStr) {
//     try {
//         // Send request to fetch schedule for the selected date
//         const response = await fetch(`https://college-schedule.vercel.app/getSchedule?date=${dateStr}`);
//         const data = await response.json();

//         if (response.ok) {
//             const scheduleData = data.schedule || [];
//             scheduleTableBody.innerHTML = ''; // Clear previous data

//             if (scheduleData.length > 0) {
//                 // Populate schedule table with fetched data
//                 populateScheduleTable(scheduleData);

//                 // Display the schedule table container
//                 scheduleTableContainer.style.display = 'block';
//             } else {
//                 alert('No schedule found for the selected date.');
//             }
//         } else {
//             alert('Failed to fetch schedule: ' + data.error);
//         }
//     } catch (error) {
//         console.error('Error fetching schedule:', error);
//         alert('Error connecting to the server.');
//     }
// }
function showScheduleForDate(dateStr) {
    // Convert date string (YYYY-MM-DD) to a Date object
    const dateObj = new Date(dateStr);

    // Get the weekday name (e.g., Monday, Tuesday)
    const options = { weekday: 'long' };
    const weekdayName = dateObj.toLocaleDateString('en-US', options);

    // Set the selected weekday in the form's "day" input field
    document.getElementById('day').value = weekdayName;

    console.log(`Selected Day: ${weekdayName}`);
}

// Search and View Schedule for Specific Criteria
document.getElementById('view-schedule-btn').addEventListener('click', function() {
    // Get the selected values from the form
    const year = document.getElementById('year').value;
    const department = document.getElementById('department').value;
    const section = document.getElementById('section').value;
    const day = document.getElementById('day').value;

    // Make the API request to get the schedule
    fetch(`https://college-schedule.vercel.app/getSchedule?year=${encodeURIComponent(year)}&department=${encodeURIComponent(department)}&section=${encodeURIComponent(section)}&day=${encodeURIComponent(day)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                // Clear the previous schedule
                scheduleTableBody.innerHTML = ''; // Clear previous rows

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
                    scheduleTableBody.appendChild(row);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching schedule:', error);
            alert('Failed to fetch schedule. Please try again later.');
        });
});
