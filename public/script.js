document.addEventListener("DOMContentLoaded", () => {
  const startupsLink = document.getElementById("startups-link");
  const technologiesLink = document.getElementById("technologies-link");
  const cardsContainer = document.getElementById("cards-container");
  const sectionTitle = document.getElementById("section-title");

  const filterForm = document.getElementById("filterForm");
  const clearFiltersButton = document.getElementById("clearFilters");
  const filterNombre = document.getElementById("filter-nombre");
  const filterCategoria = document.getElementById("filter-categoria");
  const filterUbicacion = document.getElementById("filter-ubicacion");

  const filterFormTech = document.getElementById("filterFormTech");
  const clearFiltersTechButton = document.getElementById("clearFiltersTech");
  const filterTechCategoria = document.getElementById("filterTech-categoria");
  const filterTechEstadoAdopcion = document.getElementById(
    "filterTech-estadoAdopcion"
  );

  // Variables para almacenar los filtros
  let currentFilters = {};
  let currentFiltersTech = {};

  // URLs de las rutas del backend
  const READ_STARTUP_SERVICE_URL =
    "https://reto-ciid-desarrollo.vercel.app/api/startups/read";
  const READ_TECHNOLOGY_SERVICE_URL =
    "https://reto-ciid-desarrollo-szx1.vercel.app/api/technologies/read";
  const DELETE_STARTUP_SERVICE_URL =
    "https://reto-ciid-desarrollo-axb7.vercel.app/api/startups/delete";
  const DELETE_TECH_SERVICE_URL =
    "https://reto-ciid-desarrollo-2rr7.vercel.app/api/technologies/delete";
  const UPDATE_STARTUP_SERVICE_URL =
    "https://reto-ciid-desarrollo-szyb.vercel.app/api/startups/update";
  const UPDATE_TECH_SERVICE_URL =
    "https://reto-ciid-desarrollo-48h4.vercel.app/api/technologies/update";
  const CREATE_STARTUP_SERVICE_URL =
    "https://reto-ciid-desarrollo-cj2v.vercel.app/api/startups/create";
  const CREATE_TECH_SERVICE_URL =
    "https://reto-ciid-desarrollo-pbr3.vercel.app/api/technologies/create";

  function buildQueryString(filters) {
    const query = new URLSearchParams();
    if (filters.nombre) query.append("nombre", filters.nombre);
    if (filters.categoria) query.append("categoria", filters.categoria);
    if (filters.ubicacion) query.append("ubicacion", filters.ubicacion);
    return query.toString() ? `?${query.toString()}` : "";
  }

  function buildQueryStringTech(filters) {
    const query = new URLSearchParams();
    if (filters.categoria) query.append("categoria", filters.categoria);
    if (filters.estadoAdopcion)
      query.append("estadoAdopcion", filters.estadoAdopcion);
    return query.toString() ? `?${query.toString()}` : "";
  }

  function renderStartups(startups) {
    cardsContainer.innerHTML = "";
    startups.forEach((startup) => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <h3>${startup.nombre}</h3>
        <p><strong>Fecha de Fundación:</strong> ${formatDate(
          startup.fechaFundacion
        )}</p>
        <p><strong>Ubicación:</strong> ${startup.ubicacion}</p>
        <p><strong>Categoría:</strong> ${startup.categoria}</p>
        <p><strong>Inversión Recibida:</strong> $${
          startup.inversionRecibida
        }</p>
        <div class="buttons">
          <button class="edit-btn" data-id="${startup._id}">Editar</button>
          <button class="delete-btn" data-id="${startup._id}">Eliminar</button>
        </div>
      `;

      cardsContainer.appendChild(card);
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", handleDelete);
    });

    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", handleEdit);
    });
  }

  function renderTechnologies(technologies) {
    cardsContainer.innerHTML = "";
    // if (technologies.length === 0) {
    //   cardsContainer.innerHTML =
    //     "<p>No se encontraron technologies con los filtros aplicados.</p>";
    //   return;
    // }
    technologies.forEach((tech) => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <h3>${tech.nombre}</h3>
        <p><strong>Sector:</strong> ${tech.sector}</p>
        <p><strong>Descripción:</strong> ${tech.descripcion}</p>
        <p><strong>Estado de Adopción:</strong> ${tech.nivelAdopcion}</p>
        <p><strong>Fecha de Introducción:</strong> ${formatDate(
          tech.fechaIntroduccion
        )}</p>
        <p><strong>Categoría:</strong> ${tech.categoria}</p>
        <div class="buttons">
          <button class="edit-btn" data-id="${tech._id}">Editar</button>
          <button class="delete-btn" data-id="${tech._id}">Eliminar</button>
        </div>
      `;

      cardsContainer.appendChild(card);
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", handleDeleteTech);
    });

    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", handleEditTech);
    });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return "Fecha inválida";
    return date.toLocaleDateString();
  }

  function showStartupFilters() {
    filterForm.style.display = "block";
    filterFormTech.style.display = "none";
  }

  function showTechnologiesFilters() {
    filterForm.style.display = "none";
    filterFormTech.style.display = "block";
  }

  startupsLink.addEventListener("click", async (e) => {
    e.preventDefault();
    sectionTitle.textContent = "Startups";
    cardsContainer.innerHTML = "<p>Cargando...</p>";

    showStartupFilters();

    try {
      const response = await fetch(READ_STARTUP_SERVICE_URL);
      if (!response.ok) {
        throw new Error("Error al obtener las startups");
      }
      const data = await response.json();
      renderStartups(data);
    } catch (error) {
      console.error(error);
      cardsContainer.innerHTML = "<p>Error al cargar las startups.</p>";
    }
  });

  technologiesLink.addEventListener("click", async (e) => {
    e.preventDefault();
    sectionTitle.textContent = "Technologies";
    cardsContainer.innerHTML = "<p>Cargando...</p>";

    showTechnologiesFilters();

    try {
      const response = await fetch(READ_TECHNOLOGY_SERVICE_URL);
      if (!response.ok) {
        throw new Error("Error al obtener las technologies");
      }
      const data = await response.json();
      renderTechnologies(data);
    } catch (error) {
      console.error(error);
      cardsContainer.innerHTML = "<p>Error al cargar las technologies.</p>";
    }
  });

  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = filterNombre.value.trim();
    const categoria = filterCategoria.value.trim();
    const ubicacion = filterUbicacion.value.trim();

    currentFilters = {
      nombre: nombre || undefined,
      categoria: categoria || undefined,
      ubicacion: ubicacion || undefined,
    };

    fetchStartupsWithFilters(currentFilters);
  });

  async function fetchStartupsWithFilters(filters = {}) {
    sectionTitle.textContent = "Startups - Filtro Aplicado";
    cardsContainer.innerHTML = "<p>Cargando...</p>";

    const queryString = buildQueryString(filters);
    const url = `${READ_STARTUP_SERVICE_URL}${queryString}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error al obtener las startups con filtros");
      }
      const data = await response.json();
      renderStartups(data);
    } catch (error) {
      console.error(error);
      cardsContainer.innerHTML =
        "<p>Error al cargar las startups con los filtros aplicados.</p>";
    }
  }

  clearFiltersButton.addEventListener("click", () => {
    filterForm.reset();

    currentFilters = {};

    sectionTitle.textContent = "Startups";

    startupsLink.click();
  });

  filterFormTech.addEventListener("submit", (e) => {
    e.preventDefault();

    const categoria = filterTechCategoria.value.trim();
    const estadoAdopcion = filterTechEstadoAdopcion.value.trim();

    currentFiltersTech = {
      categoria: categoria || undefined,
      estadoAdopcion: estadoAdopcion || undefined,
    };

    fetchTechnologiesWithFilters(currentFiltersTech);
  });

  clearFiltersTechButton.addEventListener("click", () => {
    filterFormTech.reset();

    currentFiltersTech = {};

    sectionTitle.textContent = "Technologies";

    technologiesLink.click();
  });

  async function handleDelete(e) {
    const startupId = e.target.getAttribute("data-id");
    const confirmDelete = confirm(
      "¿Estás seguro de que quieres eliminar esta startup?"
    );

    if (confirmDelete) {
      try {
        const response = await fetch(
          `${DELETE_STARTUP_SERVICE_URL}/${startupId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ _id: startupId }),
          }
        );

        if (!response.ok) {
          throw new Error("Error al eliminar la startup");
        }

        const result = await response.json();
        alert(result.message || "Startup eliminada correctamente.");
        startupsLink.click();
      } catch (error) {
        console.error(error);
        alert("Hubo un error al eliminar la startup.");
      }
    }
  }

  function handleEdit(e) {
    const startupId = e.target.getAttribute("data-id");
    const card = e.target.closest(".card");
    const nombre = card.querySelector("h3").textContent;
    const fechaFundacionText = card.querySelector("p:nth-child(2)").textContent;
    const ubicacion = card
      .querySelector("p:nth-child(3)")
      .textContent.replace("Ubicación: ", "");
    const categoria = card
      .querySelector("p:nth-child(4)")
      .textContent.replace("Categoría: ", "");
    const inversionRecibidaText =
      card.querySelector("p:nth-child(5)").textContent;

    const fechaFundacion = fechaFundacionText.replace(
      "Fecha de Fundación: ",
      ""
    );
    const inversionRecibida = inversionRecibidaText.replace(
      "Inversión Recibida: $",
      ""
    );

    const editForm = document.getElementById("editForm");
    const editModal = document.getElementById("editModal");

    editForm.nombre.value = nombre;
    editForm.ubicacion.value = ubicacion;
    editForm.categoria.value = categoria;
    editForm.inversionRecibida.value = inversionRecibida;
    editForm.startupId.value = startupId;

    editModal.style.display = "block";
  }

  const closeButtonElement = document.querySelector(".close-button");
  closeButtonElement.addEventListener("click", () => {
    const editModal = document.getElementById("editModal");
    editModal.style.display = "none";
    const editForm = document.getElementById("editForm");
    editForm.reset();
  });

  window.addEventListener("click", (event) => {
    const editModal = document.getElementById("editModal");
    if (event.target == editModal) {
      editModal.style.display = "none";
      const editForm = document.getElementById("editForm");
      editForm.reset();
    }
  });

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const startupId = editForm.startupId.value;
    const nombre = editForm.nombre.value.trim();
    const ubicacion = editForm.ubicacion.value.trim();
    const categoria = editForm.categoria.value.trim();
    const inversionRecibida = parseFloat(editForm.inversionRecibida.value);

    if (!nombre || !ubicacion || !categoria || isNaN(inversionRecibida)) {
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }

    const updatedStartup = {
      _id: startupId,
      nombre,
      ubicacion,
      categoria,
      inversionRecibida,
    };

    try {
      const response = await fetch(
        `${UPDATE_STARTUP_SERVICE_URL}/${startupId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedStartup),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar la startup");
      }

      const result = await response.json();
      alert("Startup actualizada correctamente.");
      const editModal = document.getElementById("editModal");
      editModal.style.display = "none";
      editForm.reset();
      startupsLink.click();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al actualizar la startup.");
    }
  });

  const createStartupBtn = document.getElementById("create-startup-btn");
  const createModal = document.getElementById("createModal");
  const closeButtonCreateElement = document.querySelector(
    ".close-button-create"
  );
  const createForm = document.getElementById("createForm");

  createStartupBtn.addEventListener("click", () => {
    createModal.style.display = "block";
  });

  closeButtonCreateElement.addEventListener("click", () => {
    createModal.style.display = "none";
    createForm.reset();
  });

  window.addEventListener("click", (event) => {
    if (event.target == createModal) {
      createModal.style.display = "none";
      createForm.reset();
    }
  });

  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = createForm.nombre.value.trim();
    const ubicacion = createForm.ubicacion.value.trim();
    const categoria = createForm.categoria.value.trim();
    const inversionRecibida = parseFloat(createForm.inversionRecibida.value);
    const fechaFundacion = createForm.fechaFundacion.value;

    if (
      !nombre ||
      !ubicacion ||
      !categoria ||
      isNaN(inversionRecibida) ||
      !fechaFundacion
    ) {
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }

    const newStartup = {
      nombre,
      ubicacion,
      categoria,
      inversionRecibida,
      fechaFundacion,
    };

    try {
      const response = await fetch(CREATE_STARTUP_SERVICE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStartup),
      });

      if (!response.ok) {
        throw new Error("Error al crear la startup");
      }

      const result = await response.json();
      alert("Startup creada correctamente.");
      createModal.style.display = "none";
      createForm.reset();
      startupsLink.click();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al crear la startup.");
    }
  });

  async function fetchTechnologiesWithFilters(filters = {}) {
    sectionTitle.textContent = "Technologies - Filtro Aplicado";
    cardsContainer.innerHTML = "<p>Cargando...</p>";

    const queryString = buildQueryStringTech(filters);
    const url = `https://readtechnologiesservice.onrender.com/api/technologies/read${queryString}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error al obtener las technologies con filtros");
      }
      const data = await response.json();
      renderTechnologies(data.technologies);
    } catch (error) {
      console.error(error);
      cardsContainer.innerHTML =
        "<p>Error al cargar las technologies con los filtros aplicados.</p>";
    }
  }

  async function handleDeleteTech(e) {
    const techId = e.target.getAttribute("data-id");
    const confirmDelete = confirm(
      "¿Estás seguro de que quieres eliminar esta Technology?"
    );

    if (confirmDelete) {
      try {
        const response = await fetch(`${DELETE_TECH_SERVICE_URL}/${techId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al eliminar la Technology");
        }

        const result = await response.json();
        alert(result.message || "Technology eliminada correctamente.");
        fetchTechnologiesWithFilters(currentFiltersTech);
      } catch (error) {
        console.error(error);
        alert("Hubo un error al eliminar la Technology.");
      }
    }
  }

  function handleEditTech(e) {
    const techId = e.target.getAttribute("data-id");
    const card = e.target.closest(".card");
    const nombre = card.querySelector("h3").textContent;
    const sector = card
      .querySelector("p:nth-child(2)")
      .textContent.replace("Sector: ", "");
    const descripcion = card
      .querySelector("p:nth-child(3)")
      .textContent.replace("Descripción: ", "");
    const estadoAdopcion = card
      .querySelector("p:nth-child(4)")
      .textContent.replace("Estado de Adopción: ", "");
    const fechaIntroduccion = card
      .querySelector("p:nth-child(5)")
      .textContent.replace("Fecha de Introducción: ", "");
    const categoria = card
      .querySelector("p:nth-child(6)")
      .textContent.replace("Categoría: ", "");

    const techEditForm = document.getElementById("techEditForm");
    const editTechModal = document.getElementById("editTechModal");

    techEditForm["tech-nombre"].value = nombre;
    techEditForm["tech-sector"].value = sector;
    techEditForm["tech-descripcion"].value = descripcion;
    techEditForm["tech-categoria"].value = categoria;
    techEditForm["tech-nivelAdopcion"].value = estadoAdopcion;
    techEditForm["techId"].value = techId;

    editTechModal.style.display = "block";
  }

  const closeTechEditButton = document.querySelector(".close-tech-edit-button");
  closeTechEditButton.addEventListener("click", () => {
    const editTechModal = document.getElementById("editTechModal");
    editTechModal.style.display = "none";
    const techEditForm = document.getElementById("techEditForm");
    techEditForm.reset();
  });

  window.addEventListener("click", (event) => {
    const editTechModal = document.getElementById("editTechModal");
    if (event.target == editTechModal) {
      editTechModal.style.display = "none";
      const techEditForm = document.getElementById("techEditForm");
      techEditForm.reset();
    }
  });

  techEditForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const techId = techEditForm.techId.value;
    const nombre = techEditForm.nombre.value.trim();
    const sector = techEditForm.sector.value.trim();
    const descripcion = techEditForm.descripcion.value.trim();
    const categoria = techEditForm.categoria.value.trim();
    const nivelAdopcion = techEditForm.nivelAdopcion.value.trim();

    if (!nombre || !sector || !descripcion || !categoria || !nivelAdopcion) {
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }

    const updatedTech = {
      _id: techId,
      nombre,
      sector,
      descripcion,
      categoria,
      nivelAdopcion,
    };

    try {
      const response = await fetch(`${UPDATE_TECH_SERVICE_URL}/${techId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTech),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la Technology");
      }

      const result = await response.json();
      alert("Technology actualizada correctamente.");
      // Cerrar el modal y recargar las technologies
      const editTechModal = document.getElementById("editTechModal");
      editTechModal.style.display = "none";
      techEditForm.reset();
      technologiesLink.click();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al actualizar la Technology.");
    }
  });

  const createTechnologyBtn = document.getElementById("create-technology-btn");
  const createTechModal = document.getElementById("createTechModal");
  const closeTechCreateButton = document.querySelector(
    ".close-tech-create-button"
  );
  const techCreateForm = document.getElementById("techCreateForm");

  createTechnologyBtn.addEventListener("click", () => {
    createTechModal.style.display = "block";
  });

  closeTechCreateButton.addEventListener("click", () => {
    createTechModal.style.display = "none";
    techCreateForm.reset();
  });

  window.addEventListener("click", (event) => {
    if (event.target == createTechModal) {
      createTechModal.style.display = "none";
      techCreateForm.reset();
    }
  });

  techCreateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = techCreateForm.nombre.value.trim();
    const sector = techCreateForm.sector.value.trim();
    const descripcion = techCreateForm.descripcion.value.trim();
    const categoria = techCreateForm.categoria.value.trim();
    const nivelAdopcion = techCreateForm.nivelAdopcion.value.trim();
    const fechaIntroduccion = techCreateForm.fechaIntroduccion.value.trim();

    if (
      !nombre ||
      !sector ||
      !descripcion ||
      !categoria ||
      !nivelAdopcion ||
      !fechaIntroduccion
    ) {
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }

    const newTech = {
      nombre,
      sector,
      descripcion,
      categoria,
      nivelAdopcion,
      fechaIntroduccion,
    };

    try {
      const response = await fetch(CREATE_TECH_SERVICE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTech),
      });

      if (!response.ok) {
        throw new Error("Error al crear la Technology");
      }

      const result = await response.json();
      alert("Technology creada correctamente.");
      createTechModal.style.display = "none";
      techCreateForm.reset();
      technologiesLink.click();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al crear la Technology.");
    }
  });
});
