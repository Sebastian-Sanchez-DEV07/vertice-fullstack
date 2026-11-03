document.getElementById("year").textContent = new Date().getFullYear();

(function setupMobileNav() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");

  if (!header || !toggle || !nav) return;

  function setOpen(open) {
    header.classList.toggle("is-nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", function () {
    setOpen(!header.classList.contains("is-nav-open"));
  });

  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 640) setOpen(false);
  });
})();

function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "project-card" + (project.featured ? " project-card--featured" : "");

  const link = document.createElement("a");
  link.className = "project-card__link";
  link.href = "#contact";

  const media = document.createElement("figure");
  media.className = "project-card__media";

  const image = document.createElement("img");
  image.className = "project-image";
  image.src = project.image_url || "images/hero.jpg";
  image.alt = project.title;
  image.loading = "lazy";

  const body = document.createElement("div");
  body.className = "project-card__body";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = project.category + " / " + project.year;

  const title = document.createElement("h3");
  title.textContent = project.title;

  const description = document.createElement("p");
  description.className = "project-card__desc";
  description.textContent = project.description || "";

  const cta = document.createElement("span");
  cta.className = "project-card__cta";
  cta.textContent = "View project →";

  media.appendChild(image);
  body.append(eyebrow, title, description, cta);
  link.append(media, body);
  article.appendChild(link);

  return article;
}

async function loadProjects() {
  const grid = document.getElementById("project-grid");
  const status = document.getElementById("projects-status");

  try {
    const data = await apiRequest("/projects");
    const projects = data.projects || [];

    grid.innerHTML = "";

    if (projects.length === 0) {
      status.textContent = "No projects published yet.";
      return;
    }

    status.hidden = true;
    projects.forEach(function (project) {
      grid.appendChild(createProjectCard(project));
    });
  } catch (error) {
    status.textContent = "We could not load the projects. Please try again later.";
    status.classList.add("is-error");
    console.error(error);
  }
}

(function setupContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");

  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const button = form.querySelector('button[type="submit"]');

    status.className = "form-status";

    if (!name || !email || !message) {
      status.textContent = "Please fill in all fields.";
      status.classList.add("is-error");
      return;
    }

    button.disabled = true;
    button.textContent = "SENDING…";

    try {
      const response = await apiRequest("/messages", {
        method: "POST",
        body: { name: name, email: email, message: message },
      });

      status.textContent = response.message;
      status.classList.add("is-success");
      form.reset();
    } catch (error) {
      status.textContent =
        error.details && error.details.length > 0
          ? error.details.join(". ")
          : error.message;
      status.classList.add("is-error");
    } finally {
      button.disabled = false;
      button.textContent = "SEND MESSAGE";
    }
  });
})();

loadProjects();
