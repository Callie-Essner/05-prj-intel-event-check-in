// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const attendeeList = document.getElementById("attendeeList");

// This map lets us match each team value like "water" to the full label shown on screen.
const teamNames = {
  water: "🌊 Team Water Wise",
  zero: "🌿 Team Net Zero",
  power: "⚡ Team Renewables",
};

// This key is used to save and load all attendance data from the browser's local storage.
const storageKey = "intelEventCheckInState";
const defaultTeamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};

// Track attendance numbers and a list of everyone who has checked in.
let count = 0;
let teamCounts = { ...defaultTeamCounts };
let attendees = [];
const maxCount = 50;

// When the page loads, check whether there is saved attendance data in local storage.
// If there is, restore the total count, each team count, and the attendee list.
function loadSavedState() {
  try {
    const savedState = JSON.parse(localStorage.getItem(storageKey));

    if (savedState && typeof savedState.count === "number") {
      count = savedState.count;
    }

    if (savedState && savedState.teamCounts) {
      teamCounts = {
        water: Number(savedState.teamCounts.water) || 0,
        zero: Number(savedState.teamCounts.zero) || 0,
        power: Number(savedState.teamCounts.power) || 0,
      };
    }

    if (savedState && Array.isArray(savedState.attendees)) {
      attendees = savedState.attendees;
    }
  } catch (error) {
    console.log("Could not load saved attendance data.");
  }
}

// Save the current totals so the page remembers them after refresh or closing the browser.
function saveState() {
  const state = {
    count: count,
    teamCounts: teamCounts,
    attendees: attendees,
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.log("Could not save attendance data.");
  }
}

// Build the list of names and teams below the team counters.
function renderAttendeeList() {
  attendeeList.innerHTML = "";

  if (attendees.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.classList.add("attendee-empty");
    emptyItem.textContent = "No attendees checked in yet.";
    attendeeList.appendChild(emptyItem);
    return;
  }

  attendees.forEach(function (attendee) {
    const listItem = document.createElement("li");
    listItem.classList.add("attendee-item");

    const attendeeName = document.createElement("span");
    attendeeName.classList.add("attendee-name");
    attendeeName.textContent = attendee.name;

    const attendeeTeam = document.createElement("span");
    attendeeTeam.classList.add("attendee-team");
    attendeeTeam.classList.add(attendee.team);
    attendeeTeam.textContent = teamNames[attendee.team];

    listItem.appendChild(attendeeName);
    listItem.appendChild(attendeeTeam);
    attendeeList.appendChild(listItem);
  });
}

// This resets everything back to zero so the app can start over right now.
// It clears the live numbers, the attendee list, and the saved browser data.
function resetAttendance() {
  count = 0;
  teamCounts = { ...defaultTeamCounts };
  attendees = [];
  greeting.textContent = "";
  greeting.style.display = "none";
  greeting.classList.remove("success-message");
  localStorage.removeItem(storageKey);
  renderState();
}

// Repaint the screen using the current count and each team count.
function renderState() {
  attendeeCount.textContent = count;

  const percentage = Math.round((count / maxCount) * 100) + "%";
  progressBar.style.width = percentage;

  Object.keys(teamNames).forEach(function (teamKey) {
    const teamCounter = document.getElementById(teamKey + "Count");
    teamCounter.textContent = teamCounts[teamKey];
  });

  renderAttendeeList();
}

// Load saved data first, then immediately reset to a clean starting state.
loadSavedState();
resetAttendance();

// When someone submits the form, we read the name and selected team,
// update the totals, save them, and then redraw the page.
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Pull values from the form so we know who checked in and which team they chose.
  const name = nameInput.value;
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  console.log(name, teamName);

  // Add one to the total and to the matching team count.
  count++;
  teamCounts[team] = Number(teamCounts[team]) + 1;

  // Save the new attendee to the list so we can show the roster below the counters.
  attendees.push({
    name: name,
    team: team,
  });

  // Save to local storage so the data stays after page refreshes.
  saveState();
  renderState();
  console.log("Total check-ins:", count);

  // Once the goal is reached, find which team is currently winning and show a celebration message.
  if (count >= maxCount) {
    let winningTeam = "";
    let winningTeamCount = -1;

    const teamKeys = Object.keys(teamNames);
    teamKeys.forEach(function (teamKey) {
      const currentTeamCount = teamCounts[teamKey];

      if (currentTeamCount > winningTeamCount) {
        winningTeam = teamNames[teamKey];
        winningTeamCount = currentTeamCount;
      }
    });

    greeting.innerHTML = `🏆 Goal reached! <strong>${winningTeam}</strong> wins the summit!`;
  } else {
    const message = `🎉 Welcome, ${name} from ${teamName}`;
    greeting.textContent = message;
  }

  // Show the message in the success style and clear the form so the next person can check in.
  greeting.classList.add("success-message");
  greeting.style.display = "block";

  form.reset();
});
