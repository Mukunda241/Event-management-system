// 🔄 Auto-update event status based on date
async function autoUpdateEventStatuses() {
    console.log("🔄 Running auto-update for event statuses...");
    const API_URL = `${API_CONFIG.BASE_URL}/events`;
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) return false;
        
        const responseData = await response.json();
        // Handle both old format (array) and new format (object with events array)
        const events = Array.isArray(responseData) ? responseData : responseData.events;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let updatedCount = 0;
        
        for (const event of events) {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            
            // Auto-update to 'Completed' if date has passed and status is 'Active'
            if (eventDate < today && event.status === 'Active') {
                try {
                    const updateResponse = await fetch(`${API_URL}/${event._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...event, status: 'Completed' })
                    });
                    
                    if (updateResponse.ok) {
                        updatedCount++;
                        console.log(`✅ Updated "${event.name}" to Completed`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to update event ${event.name}:`, error);
                }
            }
        }
        
        if (updatedCount > 0) {
            console.log(`✅ Auto-updated ${updatedCount} event(s) to Completed status`);
            return true;
        }
        return false;
    } catch (error) {
        console.error("❌ Auto-update failed:", error);
        return false;
    }
}

// Wait for FullCalendar library to load
function waitForFullCalendar(maxAttempts = 100) {
    return new Promise((resolve, reject) => {
        // Check immediately first
        if (window.FullCalendar) {
            console.log('✅ FullCalendar library already loaded');
            resolve();
            return;
        }

        let attempts = 0;
        console.log('⏳ Waiting for FullCalendar library to load...');
        
        const checkInterval = setInterval(() => {
            attempts++;
            console.log(`🔍 Attempt ${attempts}/${maxAttempts} - FullCalendar:`, typeof window.FullCalendar);
            
            if (window.FullCalendar) {
                clearInterval(checkInterval);
                console.log('✅ FullCalendar library loaded successfully');
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('❌ FullCalendar library failed to load after', maxAttempts, 'attempts');
                reject(new Error('FullCalendar library failed to load'));
            }
        }, 100); // Check every 100ms
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    console.log("📅 Calendar Page Loaded!");

    // Wait for FullCalendar to be available
    try {
        await waitForFullCalendar();
    } catch (error) {
        console.error('❌ FullCalendar loading timeout:', error);
        const calendarEl = document.getElementById('calendar');
        if (calendarEl) {
            calendarEl.innerHTML = '<div class="calendar-error" style="padding:30px;text-align:center;color:#ef4444;"><h3>⚠️ Calendar Library Failed to Load</h3><p>Please check your internet connection and refresh the page.</p><button onclick="location.reload()" style="margin-top:15px;padding:10px 20px;background:var(--primary-gradient);color:white;border:none;border-radius:8px;cursor:pointer;">Refresh Page</button></div>';
        }
        return;
    }

    // Run auto-update on page load (keeps statuses fresh)
    await autoUpdateEventStatuses();

    const API_URL = `${API_CONFIG.BASE_URL}/events`;
    let allEvents = [];
    let calendar = null;

    // Utility: format date (assumes ISO date in event.date)
    function formatISO(dateStr) {
        // If dateStr already ISO, return as-is; FullCalendar accepts ISO strings
        return dateStr;
    }

    // Create a lightweight modal to show event details
    function ensureModal() {
        if (document.getElementById('event-modal')) return;
        const modal = document.createElement('div');
        modal.id = 'event-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="document.getElementById('event-modal').classList.remove('open')"></div>
            <div class="modal-card">
                <button class="modal-close" aria-label="Close">&times;</button>
                <div class="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.modal-close').addEventListener('click', () => modal.classList.remove('open'));
    }

    function showEventModal(eventObj) {
        ensureModal();
        const modal = document.getElementById('event-modal');
        const body = modal.querySelector('.modal-body');
        const e = eventObj.extendedProps || eventObj;
        body.innerHTML = `
            <h2>${eventObj.title}</h2>
            <p><strong>Date:</strong> ${eventObj.start}</p>
            <p><strong>Venue:</strong> ${e.venue || 'TBA'}</p>
            <p><strong>Organizer:</strong> ${e.organizer || 'N/A'}</p>
            <p><strong>Status:</strong> ${e.status || 'Unknown'}</p>
            <div class="modal-desc">${(e.description) ? e.description : ''}</div>
            <div style="margin-top:12px;display:flex;gap:8px;">
              <a class="btn-primary" href="event-template.html?event=${encodeURIComponent(eventObj.title)}">View Details →</a>
              <button class="btn-secondary" onclick="document.getElementById('event-modal').classList.remove('open')">Close</button>
            </div>
        `;
        modal.classList.add('open');
    }

    // Populate sidebar event lists
    function populateSidebarLists(events) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter events by status
        const liveEvents = events.filter(ev => {
            const eventDate = new Date(ev.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === today.getTime() && ev.status === 'Active';
        });

        const upcomingEvents = events.filter(ev => {
            const eventDate = new Date(ev.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate > today && ev.status === 'Active';
        }).sort((a, b) => new Date(a.date) - new Date(b.date));

        const completedEvents = events.filter(ev => ev.status === 'Completed')
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        // Populate lists
        populateEventList(liveEvents, 'live-events');
        populateEventList(upcomingEvents.slice(0, 10), 'upcoming-events');
        populateEventList(completedEvents.slice(0, 10), 'completed-events');
    }

    function populateEventList(events, listId) {
        const listEl = document.getElementById(listId);
        if (!listEl) return;

        if (events.length === 0) {
            listEl.innerHTML = '<li style="padding:20px;text-align:center;color:var(--gray-400);font-style:italic;">No events to display</li>';
            return;
        }

        listEl.innerHTML = events.map(ev => `
            <li>
                <a href="event-template.html?event=${encodeURIComponent(ev.name)}">
                    <strong>${ev.name}</strong>
                    <div style="font-size:0.85rem;color:var(--gray-600);margin-top:4px;">
                        ${new Date(ev.date).toLocaleDateString()} • ${ev.venue || 'TBA'}
                    </div>
                </a>
            </li>
        `).join('');
    }

    // render selected date events into the sidebar
    function renderSelectedDateEvents(dateStr) {
        const containerId = 'selected-date-events';
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            const sidebar = document.querySelector('.events-sidebar');
            if (sidebar) sidebar.insertBefore(container, sidebar.firstChild);
        }

        const targetDate = (new Date(dateStr)).toISOString().slice(0,10);
        const items = allEvents.filter(ev => {
            const evDate = (new Date(ev.date)).toISOString().slice(0,10);
            return evDate === targetDate;
        });

        const pretty = (d) => new Date(d).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        if (items.length === 0) {
            container.innerHTML = `<h3>Events on ${pretty(dateStr)}</h3><div style="color:#6b7280">No events for this date.</div>`;
            return;
        }

        container.innerHTML = `<h3>Events on ${pretty(dateStr)}</h3>` +
            items.map(ev => `
                <div class="selected-event-card">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <strong>${ev.name}</strong>
                        <span class="status-badge">${(ev.status||'Active')}</span>
                    </div>
                    <div class="meta">${(ev.time || '')} ${(ev.time ? '•' : '')} ${ev.venue || ''}</div>
                </div>
            `).join('');
    }

    // helper to highlight selected date cell
    function highlightSelectedDate(dateStr) {
        // remove existing
        document.querySelectorAll('.fc .selected-day').forEach(el => el.classList.remove('selected-day'));
        if (!dateStr) return;
        const iso = (new Date(dateStr)).toISOString().slice(0,10);
        // FullCalendar day cell has attribute data-date
        const cell = document.querySelector(`.fc-daygrid-day[data-date="${iso}"]`);
        if (cell) {
            cell.classList.add('selected-day');
            // also add boxed class to the number for alternative style if needed
            const num = cell.querySelector('.fc-daygrid-day-number');
            if (num) num.classList.remove('boxed'); // ensure only selected uses selected-day style
        }
    }

    // Insert simple filter controls above calendar (semantic DOM, no inline styles)
    function insertFilterControls() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        const container = document.createElement('div');
        container.className = 'calendar-controls';
        container.style.marginBottom = '10px';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'calendar-search';
        input.placeholder = 'Search events...';

        const select = document.createElement('select');
        select.className = 'calendar-status-filter';
        const opt = document.createElement('option');
        opt.value = 'all';
        opt.textContent = 'All Statuses';
        select.appendChild(opt);

        container.appendChild(input);
        container.appendChild(select);

        calendarEl.parentElement.insertBefore(container, calendarEl);

        // Wire search and status events
        input.addEventListener('input', applyFilters);
        select.addEventListener('change', applyFilters);

        return { searchInput: input, statusSelect: select };
    }

    function applyFilters() {
        // Controls may be in block scope; fall back to window.controls if needed
        const c = (typeof controls !== 'undefined' && controls) ? controls : (window.controls || {});
        const search = (c.searchInput && c.searchInput.value ? c.searchInput.value : '').toLowerCase();
        const status = (c.statusSelect && c.statusSelect.value) ? c.statusSelect.value : 'all';

        const filtered = allEvents.filter(ev => {
            const matchesSearch = ev.name.toLowerCase().includes(search) || (ev.venue || '').toLowerCase().includes(search) || (ev.organizer || '').toLowerCase().includes(search);
            const matchesStatus = (status === 'all') || ((ev.status || '').toLowerCase() === status.toLowerCase());
            return matchesSearch && matchesStatus;
        }).map(ev => ({
            id: ev._id,
            title: ev.name,
            start: formatISO(ev.date),
            extendedProps: ev
        }));

        if (calendar) {
            calendar.removeAllEvents();
            calendar.addEventSource(filtered);
        }
    }

    try {
        console.log('📡 Fetching events from:', API_URL);
        const resp = await fetch(API_URL);
        console.log('📡 Response status:', resp.status, resp.statusText);
        
        if (!resp.ok) {
            throw new Error(`Failed to fetch /events: ${resp.status} ${resp.statusText}`);
        }
        
        const data = await resp.json();
        console.log('📦 Raw data received:', data);
        
        const eventsData = Array.isArray(data) ? data : (data.events || []);
        console.log('📊 Events array:', eventsData.length, 'events');

        // Normalize events
        allEvents = eventsData.map(ev => ({
            _id: ev._id || ev.id || ev._uid,
            name: ev.name || ev.title || 'Untitled',
            date: ev.date || ev.start || new Date().toISOString(),
            venue: ev.venue || ev.location || '',
            organizer: ev.organizer || ev.author || '',
            status: ev.status || 'Active',
            description: ev.description || ev.desc || ''
        }));

        // Insert filter controls and populate status options
        const controls = insertFilterControls();
        // populate unique statuses
        const statuses = Array.from(new Set(allEvents.map(e => e.status || ''))).filter(Boolean);
        statuses.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            controls.statusSelect.appendChild(opt);
        });

        // Initialize FullCalendar
        const calendarEl = document.getElementById('calendar');
        
        console.log('🔍 Checking FullCalendar availability...');
        console.log('window.FullCalendar:', typeof window.FullCalendar);
        console.log('Calendar element found:', !!calendarEl);
        console.log('Total events loaded:', allEvents.length);
        
        if (!window.FullCalendar) {
            console.error('❌ FullCalendar library not loaded!');
            if (calendarEl) {
                calendarEl.innerHTML = '<div class="calendar-error" style="padding:30px;text-align:center;color:#ef4444;"><h3>⚠️ Calendar Failed to Load</h3><p>Please refresh the page or check your internet connection.</p><button onclick="location.reload()" style="margin-top:15px;padding:10px 20px;background:linear-gradient(135deg, #7c3aed, #c084fc);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Refresh Page</button></div>';
            }
            return;
        }

        console.log('✅ Initializing FullCalendar with', allEvents.length, 'events...');
        
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            height: 'auto',
            contentHeight: 'auto',
            aspectRatio: 1.8,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
            buttonText: {
                today: 'Today',
                month: 'Month',
                week: 'Week',
                list: 'List'
            },
            dateClick: function(info) {
                const dateStr = info.dateStr;
                highlightSelectedDate(dateStr);
                renderSelectedDateEvents(dateStr);
            },
            events: allEvents.map(ev => ({
                id: ev._id,
                title: ev.name,
                start: formatISO(ev.date),
                extendedProps: ev
            })),
            eventClick: function(info) {
                info.jsEvent.preventDefault();
                showEventModal(info.event);
            },
            // Ensure calendar renders properly
            windowResize: function() {
                calendar.updateSize();
            }
        });

        calendar.render();
        console.log('✅ Calendar rendered successfully!');

        // Populate sidebar event lists
        populateSidebarLists(allEvents);

        // Force a reflow/layout pass and ensure the calendar element matches
        // the available width of its parent container. Some global CSS can
        // cause grid children to be sized by content — we explicitly set the
        // calendar element width to the parent's clientWidth and call
        // updateSize() so FullCalendar computes sizes correctly.
        try {
            function forceWidthAndUpdate() {
                try {
                    // Use fluid sizing instead of a fixed pixel width. Some layout
                    // passes earlier may compute a small clientWidth; using 100%
                    // ensures the calendar can expand as its container grows.
                    calendarEl.style.width = '100%';
                    calendarEl.style.maxWidth = '100%';
                    calendarEl.style.minWidth = '0px';
                } catch (e) {
                    // ignore
                }
                try { calendar.updateSize(); } catch (e) { /* ignore */ }
            }

            // Run once immediately
            forceWidthAndUpdate();

            // Add a runtime stylesheet override so our width rules win over any
            // FullCalendar stylesheet loaded after page CSS. This is inserted
            // at runtime and therefore takes precedence in the cascade.
            try {
                if (!document.getElementById('fc-width-override')) {
                    const style = document.createElement('style');
                    style.id = 'fc-width-override';
                    style.textContent = `
                        /* runtime override to ensure calendar fills its container */
                        #calendar { width: 100% !important; max-width: none !important; }
                        #calendar .fc, #calendar .fc * { min-width: 0 !important; }
                        #calendar .fc .fc-daygrid, #calendar .fc .fc-daygrid .fc-daygrid-body, #calendar .fc .fc-scrollgrid { width: 100% !important; }
                    `;
                    document.head.appendChild(style);
                }
            } catch (e) {
                // ignore style injection failures
            }

            // Observe parent size changes and update calendar size to keep layout responsive
            if (window.ResizeObserver) {
                const parent = calendarEl.parentElement || document.body;
                const ro = new ResizeObserver(() => {
                    forceWidthAndUpdate();
                });
                ro.observe(parent);

                // Also observe the calendar element for good measure
                ro.observe(calendarEl);
            }
        } catch (e) {
            console.warn('calendar sizing helper failed', e);
        }

        // === Debug overlay (dev-only) ===
        // Shows bounding boxes and computed sizes for key elements to help
        // identify which element is collapsing the calendar width.
        function installDebugOverlay() {
            try {
                if (!window.location.search.includes('debug=calendar')) return;
                if (document.getElementById('calendar-debug')) return;

                const dbg = document.createElement('div');
                dbg.id = 'calendar-debug';
                dbg.innerHTML = `
                    <style id="calendar-debug-style">
                        #calendar-debug{position:fixed;right:12px;top:80px;z-index:99999;background:rgba(255,255,255,0.97);border:1px solid rgba(15,23,42,0.06);padding:12px;border-radius:10px;font-family:Segoe UI, Arial, sans-serif;box-shadow:0 8px 30px rgba(2,6,23,0.12);min-width:240px}
                        #calendar-debug pre{margin:0;font-size:12px;white-space:pre-wrap}
                        #calendar-debug .close{position:absolute;right:6px;top:6px;border:none;background:transparent;cursor:pointer;font-size:14px}
                    </style>
                    <button class="close" title="close">✕</button>
                    <div id="cal-debug-content"><pre>initializing debug panel…</pre></div>
                `;
                document.body.appendChild(dbg);
                const close = dbg.querySelector('.close');
                close.addEventListener('click', () => dbg.remove());

                const content = dbg.querySelector('#cal-debug-content pre');
                function fmtRect(r) { if (!r) return 'null'; return `${Math.round(r.width)}×${Math.round(r.height)} @${Math.round(r.left)},${Math.round(r.top)}`; }

                function updateDbg() {
                    const layout = document.querySelector('.calendar-layout');
                    const main = document.querySelector('.calendar-main');
                    const cal = document.getElementById('calendar');
                    const layoutRect = layout && layout.getBoundingClientRect();
                    const mainRect = main && main.getBoundingClientRect();
                    const calRect = cal && cal.getBoundingClientRect();
                    const computedCal = cal ? getComputedStyle(cal).width : 'n/a';
                    content.textContent = `layout:   ${fmtRect(layoutRect)}\nmain:     ${fmtRect(mainRect)}\ncalendar: ${fmtRect(calRect)}\n#calendar.style.width: ${cal ? cal.style.width || '(none)' : 'n/a'}\ncomputed #calendar width: ${computedCal}\noverridePresent: ${!!document.getElementById('fc-width-override')}`;
                }

                updateDbg();
                const iv = setInterval(updateDbg, 700);

                const mo = new MutationObserver(() => { if (!document.body.contains(dbg)) { clearInterval(iv); mo.disconnect(); } });
                mo.observe(document.body, { childList: true, subtree: true });
            } catch (e) {
                console.warn('Failed to install calendar debug overlay', e);
            }
        }

        installDebugOverlay();

        // Populate sidebar lists with categorized events and wire interactions
        try {
            const today = new Date();
            const liveEvents = [];
            const upcomingEvents = [];
            const completedEvents = [];

            // Normalize date-only comparison (ignore time)
            function toDateOnly(d) {
                const x = new Date(d);
                x.setHours(0,0,0,0);
                return x;
            }

            allEvents.forEach(ev => {
                const evDate = toDateOnly(ev.date);
                const evCopy = ev; // use normalized object
                const status = (ev.status || '').toLowerCase();

                if (status === 'completed') {
                    completedEvents.push(evCopy);
                    return;
                }

                // Treat events explicitly marked as 'live' or events occurring today as live
                const isToday = evDate.getTime() === toDateOnly(today).getTime();
                if (status === 'live' || isToday) {
                    liveEvents.push(evCopy);
                    return;
                }

                // Future dates are upcoming
                if (evDate.getTime() > toDateOnly(today).getTime()) {
                    upcomingEvents.push(evCopy);
                    return;
                }

                // Past dates (not marked completed) -> treat as completed/past
                completedEvents.push(evCopy);
            });

            populateEventList(liveEvents, 'live-events');
            populateEventList(upcomingEvents, 'upcoming-events');
            populateEventList(completedEvents, 'completed-events');
            // render selected date events for today by default
            const todayIso = new Date().toISOString().slice(0,10);
            highlightSelectedDate(todayIso);
            renderSelectedDateEvents(todayIso);

            // Click handler: clicking a sidebar item navigates the calendar to that date
            ['live-events','upcoming-events','completed-events'].forEach(listId => {
                const ul = document.getElementById(listId);
                if (!ul) return;
                ul.addEventListener('click', (ev) => {
                    const li = ev.target.closest('li[data-date]');
                    if (!li) return;
                    const dateStr = li.getAttribute('data-date');
                    if (!dateStr) return;
                    try {
                        calendar.gotoDate(dateStr);
                        // switch to month/day view for clarity
                        calendar.changeView('dayGridMonth');
                        // update selected-date UI
                        try { highlightSelectedDate(dateStr); renderSelectedDateEvents(dateStr); } catch (e) {}
                    } catch (err) {
                        console.warn('Failed to navigate calendar to date', err);
                    }
                });
            });
        } catch (err) {
            console.warn('Sidebar population failed', err);
        }

        // wire controls var to outer scope
        window.calendar = calendar;
        window.allEvents = allEvents;
        window.controls = controls;

        // --- Temporary debug snapshot: outlines ancestors and logs bounding boxes ---
        // This helps identify which container is constraining #calendar width.
        (function layoutDebugSnapshot() {
            try {
                function fmtRect(r) { if (!r) return 'null'; return `${Math.round(r.width)}×${Math.round(r.height)} @${Math.round(r.left)},${Math.round(r.top)}`; }
                const layout = document.querySelector('.calendar-layout');
                const main = document.querySelector('.calendar-main');
                const cal = document.getElementById('calendar');
                const internalSelectors = [
                    '#calendar .fc',
                    '#calendar .fc .fc-daygrid',
                    '#calendar .fc .fc-scrollgrid',
                    '#calendar .fc .fc-daygrid .fc-daygrid-body',
                    '#calendar .fc .fc-daygrid .fc-daygrid-body table'
                ];

                const items = [ ['.calendar-layout', layout], ['.calendar-main', main], ['#calendar', cal] ];

                console.group('🧭 Calendar layout snapshot');
                items.forEach(([name, el]) => {
                    if (!el) return console.log(`${name}: (not found)`);
                    const r = el.getBoundingClientRect();
                    console.log(`${name}: ${fmtRect(r)} computedWidth=${getComputedStyle(el).width} inlineWidth=${el.style.width||'(none)'} `);
                });

                // Log FullCalendar internal wrappers to see if any are narrower
                internalSelectors.forEach(sel => {
                    const el = document.querySelector(sel);
                    if (!el) return console.log(`${sel}: (not present)`);
                    const r = el.getBoundingClientRect();
                    console.log(`${sel}: ${fmtRect(r)} computedWidth=${getComputedStyle(el).width} inlineWidth=${el.style.width||'(none)'} `);
                });

                // Outline ancestors of #calendar up to body to visualize constraints
                if (cal) {
                    let el = cal;
                    let i = 0;
                    const outlines = [];
                    while (el && el !== document.body && i < 14) {
                        const prev = el.style.outline;
                        outlines.push([el, prev]);
                        try { el.style.outline = `3px dashed rgba(${(40 + i*30) % 255}, ${(120 + i*10) % 255}, ${(180 - i*10) % 255}, 0.95)`; } catch(e) {}
                        el = el.parentElement;
                        i++;
                    }
                    // remove outlines after 7 seconds
                    setTimeout(() => { outlines.forEach(([el, prev]) => { try { el.style.outline = prev; } catch(e) {} }); }, 7000);
                }

                console.groupEnd();
            } catch (e) {
                console.warn('layout debug snapshot failed', e);
            }
        })();

    } catch (err) {
        console.error('Error initializing calendar:', err);
    }
});