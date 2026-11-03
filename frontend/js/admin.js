let editingId = null;

function setStatus(element, text, type) {
  element.className = "form-status";
  element.textContent = text;

  if (type) {
    element.classList.add("is-" + type);
  }
}

function handleAuthError(error) {
  if (error.status === 401) {
    clearSession();
    window.location.replace("login.html");
    return true;
  }

  return false;
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function showUserName(name) {
  const element = document.getElementById("admin-name");

  if (element && name) {
    element.textContent = name;
  }
}

function resetForm() {
  const form = document.getElementById("project-form");
  const submit = document.getElementById("project-submit");
  const cancel = document.getElementById("project-cancel");
  const mode = document.getElementById("form-mode");

  form.reset();
  document.getElementById("project-id").value = "";
  editingId = null;
  submit.textContent = "CREATE PROJECT";
  submit.disabled = false;
  cancel.hidden = true;
  mode.textContent = "New project";
}

function startEdit(project) {
  document.getElementById("project-id").value = project.id;
  document.getElementById("title").value = project.title;
  document.getElementById("category").value = project.category;
  document.getElementById("year").value = project.year;
  document.getElementById("image_url").value = project.image_url || "";
  document.getElementById("description").value = project.description || "";
  document.getElementById("featured").checked = project.featured;

  editingId = project.id;

  const submit = document.getElementById("project-submit");
  const cancel = document.getElementById("project-cancel");
  const mode = document.getElementById("form-mode");

  submit.textContent = "SAVE CHANGES";
  cancel.hidden = false;
  mode.textContent = "Editing project #" + project.id;

  document.getElementById("project-form").scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("title").focus();
}

function createProjectItem(project) {
  const article = document.createElement("article");
  article.className = "admin-item";

  const body = document.createElement("div");
  body.className = "admin-item__body";

  const head = document.createElement("div");
  head.className = "admin-item__head";

  const title = document.createElement("h3");
  title.textContent = project.title;

  const tag = document.createElement("span");
  tag.className = "admin-tag";
  tag.textContent = project.category + " · " + project.year;

  head.append(title, tag);

  if (project.featured) {
    const badge = document.createElement("span");
    badge.className = "admin-badge";
    badge.textContent = "Featured";
    head.appendChild(badge);
  }

  const description = document.createElement("p");
  description.className = "admin-item__desc";
  description.textContent = project.description || "No description.";

  const actions = document.createElement("div");
  actions.className = "admin-item__actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "button button--ghost admin-small-button";
  editButton.dataset.action = "edit";
  editButton.dataset.id = project.id;
  editButton.textContent = "EDIT";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "button button--ghost admin-small-button admin-danger";
  deleteButton.dataset.action = "delete";
  deleteButton.dataset.id = project.id;
  deleteButton.textContent = "DELETE";

  actions.append(editButton, deleteButton);
  body.append(head, description, actions);
  article.appendChild(body);

  return article;
}

function createMessageItem(message) {
  const article = document.createElement("article");
  article.className = "admin-item";

  const body = document.createElement("div");
  body.className = "admin-item__body";

  const head = document.createElement("div");
  head.className = "admin-item__head";

  const name = document.createElement("h3");
  name.textContent = message.name;

  const email = document.createElement("a");
  email.className = "admin-link";
  email.href = "mailto:" + message.email;
  email.textContent = message.email;

  const date = document.createElement("span");
  date.className = "admin-tag";
  date.textContent = formatDate(message.created_at);

  head.append(name, email, date);

  const text = document.createElement("p");
  text.className = "admin-item__desc";
  text.textContent = message.message;

  const actions = document.createElement("div");
  actions.className = "admin-item__actions";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "button button--ghost admin-small-button admin-danger";
  deleteButton.dataset.action = "delete-message";
  deleteButton.dataset.id = message.id;
  deleteButton.textContent = "DELETE";

  actions.appendChild(deleteButton);
  body.append(head, text, actions);
  article.appendChild(body);

  return article;
}

async function loadProjects() {
  const container = document.getElementById("admin-projects");

  try {
    const data = await apiRequest("/projects");
    const projects = data.projects || [];

    container.innerHTML = "";

    if (projects.length === 0) {
      const empty = document.createElement("p");
      empty.className = "admin-empty";
      empty.textContent = "No projects yet. Create the first one above.";
      container.appendChild(empty);
      return;
    }

    projects.forEach(function (project) {
      container.appendChild(createProjectItem(project));
    });
  } catch (error) {
    if (handleAuthError(error)) return;
    container.innerHTML = "";
    const message = document.createElement("p");
    message.className = "admin-empty is-error";
    message.textContent = error.message;
    container.appendChild(message);
  }
}

async function deleteProject(id) {
  const confirmed = window.confirm("Delete this project? This cannot be undone.");
  if (!confirmed) return;

  const status = document.getElementById("project-status");

  try {
    await apiRequest("/projects/" + id, { method: "DELETE", auth: true });
    setStatus(status, "Project deleted.", "success");

    if (editingId === id) {
      resetForm();
    }

    await loadProjects();
  } catch (error) {
    if (handleAuthError(error)) return;
    setStatus(status, error.message, "error");
  }
}

async function loadMessages() {
  const container = document.getElementById("admin-messages");

  try {
    const data = await apiRequest("/messages", { auth: true });
    const messages = data.messages || [];

    container.innerHTML = "";

    if (messages.length === 0) {
      const empty = document.createElement("p");
      empty.className = "admin-empty";
      empty.textContent = "No messages yet.";
      container.appendChild(empty);
      return;
    }

    messages.forEach(function (message) {
      container.appendChild(createMessageItem(message));
    });
  } catch (error) {
    if (handleAuthError(error)) return;
    container.innerHTML = "";
    const message = document.createElement("p");
    message.className = "admin-empty is-error";
    message.textContent = error.message;
    container.appendChild(message);
  }
}

async function deleteMessage(id) {
  const confirmed = window.confirm("Delete this message?");
  if (!confirmed) return;

  try {
    await apiRequest("/messages/" + id, { method: "DELETE", auth: true });
    await loadMessages();
  } catch (error) {
    if (handleAuthError(error)) return;
    window.alert(error.message);
  }
}

function setupProjectForm() {
  const form = document.getElementById("project-form");
  const status = document.getElementById("project-status");
  const cancel = document.getElementById("project-cancel");

  cancel.addEventListener("click", function () {
    resetForm();
    setStatus(status, "", "");
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value.trim();
    const year = Number(document.getElementById("year").value);
    const imageUrl = document.getElementById("image_url").value.trim();
    const description = document.getElementById("description").value.trim();
    const featured = document.getElementById("featured").checked;
    const submit = document.getElementById("project-submit");

    if (!title || !category) {
      setStatus(status, "Title and category are required.", "error");
      return;
    }

    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      setStatus(status, "Year must be between 1900 and 2100.", "error");
      return;
    }

    const payload = {
      title: title,
      category: category,
      year: year,
      image_url: imageUrl,
      description: description,
      featured: featured,
    };

    submit.disabled = true;

    try {
      if (editingId) {
        await apiRequest("/projects/" + editingId, {
          method: "PUT",
          auth: true,
          body: payload,
        });
        resetForm();
        setStatus(status, "Project updated.", "success");
      } else {
        await apiRequest("/projects", {
          method: "POST",
          auth: true,
          body: payload,
        });
        resetForm();
        setStatus(status, "Project created.", "success");
      }

      await loadProjects();
    } catch (error) {
      if (handleAuthError(error)) return;
      submit.disabled = false;
      setStatus(
        status,
        error.details && error.details.length > 0
          ? error.details.join(". ")
          : error.message,
        "error"
      );
    }
  });
}

function setupProjectList() {
  const container = document.getElementById("admin-projects");

  container.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = Number(button.dataset.id);

    if (button.dataset.action === "delete") {
      deleteProject(id);
      return;
    }

    if (button.dataset.action === "edit") {
      apiRequest("/projects/" + id)
        .then(function (data) {
          startEdit(data.project);
        })
        .catch(function (error) {
          setStatus(document.getElementById("project-status"), error.message, "error");
        });
    }
  });
}

function setupMessageList() {
  const container = document.getElementById("admin-messages");

  container.addEventListener("click", function (event) {
    const button = event.target.closest('button[data-action="delete-message"]');
    if (!button) return;

    deleteMessage(Number(button.dataset.id));
  });
}

function setupHeader() {
  document.getElementById("logout-button").addEventListener("click", function () {
    clearSession();
    window.location.replace("login.html");
  });

  document.getElementById("reload-projects").addEventListener("click", loadProjects);
  document.getElementById("reload-messages").addEventListener("click", loadMessages);
}

async function init() {
  if (!getToken()) {
    window.location.replace("login.html");
    return;
  }

  const storedUser = getStoredUser();

  if (storedUser) {
    showUserName(storedUser.name);
  }

  setupHeader();
  setupProjectForm();
  setupProjectList();
  setupMessageList();

  try {
    const data = await apiRequest("/auth/me", { auth: true });
    showUserName(data.user.name);
  } catch (error) {
    if (handleAuthError(error)) return;
  }

  await loadProjects();
  await loadMessages();
}

init();
