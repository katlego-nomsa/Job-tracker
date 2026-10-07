1. DATA (db.json)

DATA:
  users = [ { id, username, password } ]
  jobs  = [ { id, userId, company, role, status, dateApplied, duties,
              address?, contact?, requirements?, notes? } ]

CONSTANTS:
  STATUSES       = ["Applied", "Interviewed", "Rejected"]
  FILTER_OPTIONS = ["All", "Applied", "Interviewed", "Rejected"]
  SORT_OPTIONS   = ["asc", "desc"]
  DEFAULTS       = { search: "", status: "All", sort: "desc" }
  TOAST_TIME     = 3 seconds


2. SERVER CALLS (JSON server)

function getUsers(filters):   return GET  /users?{filters}
function addUser(user):       return POST /users          with user
function getJobs(userId):     return GET  /jobs?userId={userId}
function getJob(id):          return GET  /jobs/{id}
function addJob(job):         return POST /jobs           with job
function updateJob(id, data): return PATCH /jobs/{id}     with data
function deleteJob(id):       return DELETE /jobs/{id}


4. ROUTES

function App():
  wrap everything in AuthProvider
  wrap everything in ToastProvider
  routes:
    "/"           -> Landing
    "/register"   -> Register
    "/login"      -> Login
    "/home"       -> ProtectedRoute( Home )
    "/jobs/:id"   -> ProtectedRoute( JobDetails )
    anything else -> NotFound


4. AUTH CONTEXT

function AuthProvider():
  currentUser = none

  WHEN THE APP STARTS:
    saved = sessionStorage.get("user")
    if saved exists:
      currentUser = saved
    else:
      currentUser = none

  function login(user):
    currentUser = user
    sessionStorage.set("user", user)

  function logout():
    currentUser = none
    sessionStorage.remove("user")
    goTo("/login")

  share currentUser, login, logout with every page


5. PROTECTED ROUTE

function ProtectedRoute(page):
  user = auth.currentUser
  if user is none:
    goTo("/login", wantedPage = currentPath)
  else:
    show(page)


6. REGISTER PAGE

function Register():
  state: username = "", password = "", confirm = ""
  state: errors = [], isSubmitting = false

  function validate():
    errors = []
    if username is empty or username.length < 3:
      errors.add("Username must be at least 3 characters")
    if password.length < 8:
      errors.add("Password must be at least 8 characters")
    if confirm != password:
      errors.add("Passwords do not match")
    return errors

  function onRegisterClick():
    result = validate()
    if result is not empty:
      errors = result
      showErrorsUnderFields()
      return

    isSubmitting = true
    try:
      existing = getUsers({ username })
      if existing is not empty:
        showUnderUsername("That username is taken")
        return
      addUser({ username, password })
      showToast("success", "Account created")
      goTo("/login")
    catch:
      showToast("error", "Something went wrong, please try again")
    finally:
      isSubmitting = false


7. LOGIN PAGE

function Login():
  state: username = "", password = ""
  state: error = "", isSubmitting = false

  function onLoginClick():
    error = ""
    if username is empty or password is empty:
      error = "Please fill in both fields"
      return

    isSubmitting = true
    try:
      result = getUsers({ username, password })
      if result is empty:
        error = "Incorrect username or password"
      else:
        auth.login(result[0])
        if wantedPage exists:
          goTo(wantedPage)
        else:
          goTo("/home")
    catch:
      showToast("error", "Something went wrong")
    finally:
      isSubmitting = false


8. HOME PAGE

function Home():
  state: jobs = [], isLoading = true
  state: formOpen = false, editingJob = none, jobToDelete = none
  state: isSaving = false

  WHEN THE PAGE FIRST LOADS:
    loadJobs()

  function loadJobs():
    isLoading = true
    try:
      jobs = getJobs(auth.currentUser.id)
    catch:
      showToast("error", "Could not load jobs")
    finally:
      isLoading = false

  function readUrl():
    search = url.get("search")
    if search is missing:
      search = ""

    status = url.get("status")
    if status is missing or status not in FILTER_OPTIONS:
      status = "All"

    sort = url.get("sort")
    if sort is missing or sort not in SORT_OPTIONS:
      sort = "desc"

    return { search, status, sort }

  function visibleJobs():
    { search, status, sort } = readUrl()
    list = jobs

    if search is not empty:
      list = jobs where
        lowercase(company) contains lowercase(search)
        or lowercase(role) contains lowercase(search)

    if status != "All":
      list = list where job.status == status

    if sort == "desc":
      sort list by dateApplied, newest first
    else:
      sort list by dateApplied, oldest first

    return list

  function counts():
    return {
      total:       jobs.length,
      applied:     count of jobs with status "Applied",
      interviewed: count of jobs with status "Interviewed",
      rejected:    count of jobs with status "Rejected"
    }

  function updateParam(name, value):
    params = copy of current URL values
    if value is empty or value == DEFAULTS[name]:
      params.remove(name)
    else:
      params.set(name, value)
    replaceUrl(params)

  function onSearchTyped(text):   updateParam("search", text)
  function onStatusChipClick(s):  updateParam("status", s)
  function onSortChanged(s):      updateParam("sort", s)
  function onClearFiltersClick(): replaceUrl(empty params)

  function display():
    list = visibleJobs()
    c = counts()

    show search box, status chips (with counts), sort dropdown, "+ Add job"

    if isLoading:
      show loader
    else if jobs is empty:
      show "No jobs yet"
      show "Add job" button
    else if list is empty:
      show "No jobs match your search"
      show "Clear filters" link
    else:
      for each job in list:
        show card:
          company, role
          status badge (colour by status)
          dateApplied
          first part of duties
          Edit button    -> onEditClick(job)
          Delete button  -> onDeleteClick(job)
          link           -> "/jobs/" + job.id

    if formOpen:    show JobForm
    if jobToDelete: show popup "Delete this job? This cannot be undone."

  function onAddClick():
    editingJob = none
    formOpen = true

  function onEditClick(job):
    editingJob = job
    formOpen = true

  function validateJob(data):
    errors = []
    if data.company is empty:  errors.add("Company is required")
    if data.role is empty:     errors.add("Role is required")
    if data.duties is empty:   errors.add("Duties are required")
    if data.status not in STATUSES:
      errors.add("Status must be Applied, Interviewed or Rejected")
    if data.dateApplied is empty:
      errors.add("Date applied is required")
    else if data.dateApplied > today:
      errors.add("Date applied cannot be in the future")
    return errors

  function onSaveClick(data):
    errors = validateJob(data)
    if errors is not empty:
      showErrors(errors)
      return

    isSaving = true
    try:
      if editingJob is none:
        saved = addJob({ ...data, userId: auth.currentUser.id })
        jobs.add(saved)
        showToast("success", "Job added")
      else:
        changes = only the fields that differ from editingJob
        updated = updateJob(editingJob.id, changes)
        jobs.replace(editingJob.id, updated)
        showToast("success", "Job updated")
      formOpen = false
    catch:
      showToast("error", "Something went wrong")
    finally:
      isSaving = false

  function onFormCloseClick():
    formOpen = false

  function onDeleteClick(job):
    jobToDelete = job

  function onCancelClick():
    jobToDelete = none

  function onConfirmClick():
    try:
      deleteJob(jobToDelete.id)
      jobs.remove(jobToDelete.id)
      showToast("success", "Job deleted")
    catch:
      showToast("error", "Something went wrong")
    finally:
      jobToDelete = none


9. JOB DETAILS PAGE

function JobDetails():
  state: job = none, isLoading = true, notFound = false
  state: formOpen = false, editingJob = none, jobToDelete = none
  state: isSaving = false

  WHEN THE PAGE LOADS:
    loadJob()

  function loadJob():
    id = url.params.id
    isLoading = true
    try:
      found = getJob(id)
      if found is none or found.userId != auth.currentUser.id:
        notFound = true
      else:
        job = found
    catch:
      notFound = true
    finally:
      isLoading = false

  function display():
    if isLoading:
      show loader
    else if notFound:
      show NotFound (404)
    else:
      show:
        company, role
        status badge
        dateApplied
        address, contact
        duties, requirements, notes
        Edit button            -> onEditClick(job)
        Delete button          -> onDeleteClick(job)
        "Back to my jobs" link -> goTo("/home")

  function onEditClick(job):
    editingJob = job
    formOpen = true

  function onSaveClick(data):
    same checks and steps as on Home, using validateJob(data)
    on success: job = updated job, showToast("success", "Job updated")

  function onDeleteClick(job):
    jobToDelete = job

  function onCancelClick():
    jobToDelete = none

  function onConfirmClick():
    try:
      deleteJob(jobToDelete.id)
      showToast("success", "Job deleted")
      goTo("/home")
    catch:
      showToast("error", "Something went wrong")
    finally:
      jobToDelete = none


10. TOASTS

function ToastProvider():
  state: messages = []

  function showToast(type, message):
    item = { id: newId(), type, message }
    messages.add(item)
    after TOAST_TIME:
      messages.remove(item)

  display:
    for each item in messages:
      show a pop-up in its colour (success = green, error = red)


11. LOGOUT (the end)

function onLogoutClick():
  auth.logout()
