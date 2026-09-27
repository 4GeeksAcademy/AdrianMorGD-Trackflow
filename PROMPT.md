### CONTEXT
People & Talent department is in the middle of an active recruitment campaign. The open position received over 100 applications in less than two weeks, and the team is overwhelmed: they're tracking candidates in a shared spreadsheet, writing interview notes in separate documents, and updating statuses manually over email threads.

### API DOCUMENTATION
Read the api url inside the .env to be familiar with the tasks implementation that will be driven by it.

#### TASKS OVERVIEW
- Show all candidates in a list — name, position, current status, and current stage at a glance.
- Allow filtering by status and by stage, and searching by name or email without reloading the page.
- Open a candidate's detail view and, from there, change their status or stage with a single interaction.
- Add internal notes to a candidate and delete them when they're no longer relevant.
- Register new candidates directly from the interface and edit a candidate's data when something needs to be corrected.
#### TASKS IMPLEMENTATION
### Views and routing
- Create a candidate list page that displays all candidates obtained from GET/Records
- Create a candidate detail page /candidates/[id] that fetches and displays full candidate data from GET/records/:id
- Navigation betwwen list and detail muste next.js routing not full page reloads
### Candidate list
- Display each candidates full name,posiitonm applied for, current status, and current stage
- Implement filter by status and filter by stage using query parameters (useSearchParams)
Implement a search input that filters by name or email without reloading page
Show a loading state while data is being fecthed and an error message if the reqauest fails
### Canidate detail
- Display all available fields: name, email,phone,positionm,Linkedin,CV link,years of experience,status,stage and application date
- Include a control to update status via PATCH /records/:id
- Include a control to update stage via PATCH /records/:id
- Display the list of notes fetched from GET /records/:idnotes
- Allow adding new note via POST /records/id:notes/note_id

### Candidate management
- Include a form to register a new candidate POST/records
- Include a form to edit a candidates data PUT/records/:id
- Both forms must validate required fields before submission
- Show success and error feedback after each form submission

### State and async handling
- All API calls must be handled with async/await
- Every data fteching operation must have at least three UI states: loading, success and error
- After a PATCH, PUT or POST, update the UI to reflect the change without requiring a full page reload

##### Code structure
- organize project with clear folder structure /components, /hooks (if applicable) /types, /lib or /services
- Define Typescript types for all data structures received from API

##### IMPORTANT 
- The terminology, labels, and framing visible in your UI must reflect your company's context as described in your CONTEXT.es.md. For example,company is TrackFlow, the interface should feel like an internal TrackFlow People & Talent tool, even though the API field names remain those defined by the tracker backend. A generic implementation that ignores the company scenario will not be accepted.
- Use only Next.js (App Router), React, and TypeScript. Do not use external state management libraries (Redux, Zustand, Jotai, etc.). Component-level state with hooks is sufficient for this milestone.
- Make sure .env isn ot commitable and include a .env.example file documenting the required environment variables to run project by someone else


