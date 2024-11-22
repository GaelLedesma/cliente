document.addEventListener("DOMContentLoaded", () => {
  const startupsLink = document.getElementById("startups-link");
  const technologiesLink = document.getElementById("technologies-link");
  const cardsContainer = document.getElementById("cards-container");
  const sectionTitle = document.getElementById("section-title");

  const filterForm = document.getElementById("filterForm");
  const filterFormTech = document.getElementById("filterFormTech");
  const clearFiltersButton = document.getElementById("clearFilters");
  const clearFiltersTechButton = document.getElementById("clearFiltersTech");

  const createStartupBtn = document.getElementById("create-startup-btn");
  const createTechnologyBtn = document.getElementById("create-technology-btn");

  let currentFilters = {};
  let currentFiltersTech = {};

  const API_BASE_URL = "https://api-gateway-swart.vercel.app/api";
  const SERVICES = {
    startups: {
      read: `${API_BASE_URL}/startups/read`,
      create: `${API_BASE_URL}/startups/create`,
      update: `${API_BASE_URL}/startups/update`,
      delete: `${API_BASE_URL}/startups/delete`,
    },
    technologies: {
      read: `${API_BASE_URL}/technologies/read`,
      create: `${API_BASE_URL}/technologies/create`,
      update: `${API_BASE_URL}/technologies/update`,
      delete: `${API_BASE_URL}/technologies/delete`,
    },
  };

  function buildQueryString(filters) {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });
    return query.toString() ? `?${query.toString()}` : "";
  }

  function renderItems(items, type) {
    cardsContainer.innerHTML = "";
    if (items.length === 0) {
      cardsContainer.innerHTML = `<p>No se encontraron ${type} con los filtros aplicados.</p>`;
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.classList.add("card");

      if (type === "startups") {
        card.innerHTML = `
          <h3>${item.nombre}</h3>
          <p><strong>Fecha de Fundación:</strong> ${formatDate(
            item.fechaFundacion
          )}</p>
          <p><strong>Ubicación:</strong> ${item.ubicacion}</p>
          <p><strong>Categoría:</strong> ${item.categoria}</p>
          <p><strong>Inversión Recibida:</strong> $${item.inversionRecibida}</p>
          <div class="buttons">
            <button class="edit-btn" data-id="${
              item._id
            }" data-type="startups">Editar</button>
            <button class="delete-btn" data-id="${
              item._id
            }" data-type="startups">Eliminar</button>
          </div>
        `;
      } else if (type === "technologies") {
        card.innerHTML = `
          <h3>${item.nombre}</h3>
          <p><strong>Sector:</strong> ${item.sector}</p>
          <p><strong>Descripción:</strong> ${item.descripcion}</p>
          <p><strong>Estado de Adopción:</strong> ${item.nivelAdopcion}</p>
          <p><strong>Fecha de Introducción:</strong> ${formatDate(
            item.fechaIntroduccion
          )}</p>
          <p><strong>Categoría:</strong> ${item.categoria}</p>
          <div class="buttons">
            <button class="edit-btn" data-id="${
              item._id
            }" data-type="technologies">Editar</button>
            <button class="delete-btn" data-id="${
              item._id
            }" data-type="technologies">Eliminar</button>
          </div>
        `;
      }

      cardsContainer.appendChild(card);
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", handleDelete);
    });

    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", handleEdit);
    });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return "Fecha inválida";
    return date.toLocaleDateString();
  }

  function showStartupSection() {
    filterForm.style.display = "block";
    filterFormTech.style.display = "none";
    createStartupBtn.style.display = "block";
    createTechnologyBtn.style.display = "none";
  }

  function showTechnologiesSection() {
    filterForm.style.display = "none";
    filterFormTech.style.display = "block";
    createStartupBtn.style.display = "none";
    createTechnologyBtn.style.display = "block";
  }

  async function fetchItems(type, filters = {}) {
    sectionTitle.textContent = `${
      type.charAt(0).toUpperCase() + type.slice(1)
    }`;
    cardsContainer.innerHTML = "<p>Cargando...</p>";

    const queryString = buildQueryString(filters);
    const url = SERVICES[type].read;

    try {
      const response = await fetch(`${url}${queryString}`);
      if (!response.ok) throw new Error(`Error al obtener las ${type}`);
      const data = await response.json();
      renderItems(data, type);
    } catch (error) {
      console.error(error);
      cardsContainer.innerHTML = `<p>Error al cargar las ${type}.</p>`;
    }
  }

  startupsLink.addEventListener("click", (e) => {
    e.preventDefault();
    showStartupSection();
    fetchItems("startups");
  });

  technologiesLink.addEventListener("click", (e) => {
    e.preventDefault();
    showTechnologiesSection();
    fetchItems("technologies");
  });

  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("filter-nombre").value.trim();
    const categoria = document.getElementById("filter-categoria").value.trim();
    const ubicacion = document.getElementById("filter-ubicacion").value.trim();

    currentFilters = { nombre, categoria, ubicacion };
    fetchItems("startups", currentFilters);
  });

  clearFiltersButton.addEventListener("click", () => {
    filterForm.reset();
    currentFilters = {};
    startupsLink.click();
  });

  filterFormTech.addEventListener("submit", (e) => {
    e.preventDefault();
    const categoria = document
      .getElementById("filterTech-categoria")
      .value.trim();
    const estadoAdopcion = document
      .getElementById("filterTech-estadoAdopcion")
      .value.trim();

    currentFiltersTech = { categoria, estadoAdopcion };
    fetchItems("technologies", currentFiltersTech);
  });

  clearFiltersTechButton.addEventListener("click", () => {
    filterFormTech.reset();
    currentFiltersTech = {};
    technologiesLink.click();
  });

  async function handleDelete(e) {
    const id = e.target.getAttribute("data-id");
    const type = e.target.getAttribute("data-type");
    const confirmDelete = confirm(
      `¿Estás seguro de que quieres eliminar este(a) ${type}?`
    );

    if (confirmDelete) {
      const deleteUrl = SERVICES[type].delete;
      try {
        const response = await fetch(`${deleteUrl}/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`Error al eliminar el/la ${type}`);

        alert(
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } eliminada correctamente.`
        );
        type === "startups" ? startupsLink.click() : technologiesLink.click();
      } catch (error) {
        console.error(error);
        alert(`Hubo un error al eliminar el/la ${type}.`);
      }
    }
  }

  function handleEdit(e) {
    const id = e.target.getAttribute("data-id");
    const type = e.target.getAttribute("data-type");
    if (type === "startups") {
      openEditStartupModal(id);
    } else {
      openEditTechnologyModal(id);
    }
  }

  function openEditStartupModal(startupId) {
    const card = document
      .querySelector(`button[data-id="${startupId}"]`)
      .closest(".card");
    const nombre = card.querySelector("h3").textContent;
    const ubicacion = card
      .querySelector("p:nth-child(3)")
      .textContent.replace("Ubicación: ", "");
    const categoria = card
      .querySelector("p:nth-child(4)")
      .textContent.replace("Categoría: ", "");
    const inversionRecibidaText =
      card.querySelector("p:nth-child(5)").textContent;

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

  function openEditTechnologyModal(techId) {
    const card = document
      .querySelector(`button[data-id="${techId}"]`)
      .closest(".card");
    const nombre = card.querySelector("h3").textContent;
    const sector = card
      .querySelector("p:nth-child(2)")
      .textContent.replace("Sector: ", "");
    const descripcion = card
      .querySelector("p:nth-child(3)")
      .textContent.replace("Descripción: ", "");
    const nivelAdopcion = card
      .querySelector("p:nth-child(4)")
      .textContent.replace("Estado de Adopción: ", "");
    const categoria = card
      .querySelector("p:nth-child(6)")
      .textContent.replace("Categoría: ", "");

    const techEditForm = document.getElementById("techEditForm");
    const editTechModal = document.getElementById("editTechModal");

    techEditForm.nombre.value = nombre;
    techEditForm.sector.value = sector;
    techEditForm.descripcion.value = descripcion;
    techEditForm.categoria.value = categoria;
    techEditForm.nivelAdopcion.value = nivelAdopcion;
    techEditForm.techId.value = techId;

    editTechModal.style.display = "block";
  }

  document.querySelector(".close-button").addEventListener("click", () => {
    document.getElementById("editModal").style.display = "none";
    document.getElementById("editForm").reset();
  });

  document
    .querySelector(".close-tech-edit-button")
    .addEventListener("click", () => {
      document.getElementById("editTechModal").style.display = "none";
      document.getElementById("techEditForm").reset();
    });

  window.addEventListener("click", (event) => {
    if (event.target == document.getElementById("editModal")) {
      document.getElementById("editModal").style.display = "none";
      document.getElementById("editForm").reset();
    }
    if (event.target == document.getElementById("editTechModal")) {
      document.getElementById("editTechModal").style.display = "none";
      document.getElementById("techEditForm").reset();
    }
  });

  const editForm = document.getElementById("editForm");
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
      const response = await fetch(`${SERVICES.startups.update}/${startupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStartup),
      });

      if (!response.ok) throw new Error("Error al actualizar la startup");

      alert("Startup actualizada correctamente.");
      document.getElementById("editModal").style.display = "none";
      editForm.reset();
      startupsLink.click();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al actualizar la startup.");
    }
  });

  const techEditForm = document.getElementById("techEditForm");
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

    const updatedTechnology = {
      _id: techId,
      nombre,
      sector,
      descripcion,
      categoria,
      nivelAdopcion,
    };

    try {
      const response = await fetch(
        `${SERVICES.technologies.update}/${techId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTechnology),
        }
      );

      if (!response.ok) throw new Error("Error al actualizar la technology");

      alert("Technology actualizada correctamente.");
      document.getElementById("editTechModal").style.display = "none";
      techEditForm.reset();
      technologiesLink.click();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al actualizar la technology.");
    }
  });

  createStartupBtn.addEventListener("click", () => {
    document.getElementById("createModal").style.display = "block";
  });

  createTechnologyBtn.addEventListener("click", () => {
    document.getElementById("createTechModal").style.display = "block";
  });

  document
    .querySelector(".close-button-create")
    .addEventListener("click", () => {
      document.getElementById("createModal").style.display = "none";
      document.getElementById("createForm").reset();
    });

  document
    .querySelector(".close-tech-create-button")
    .addEventListener("click", () => {
      document.getElementById("createTechModal").style.display = "none";
      document.getElementById("techCreateForm").reset();
    });

  window.addEventListener("click", (event) => {
    if (event.target == document.getElementById("createModal")) {
      document.getElementById("createModal").style.display = "none";
      document.getElementById("createForm").reset();
    }
    if (event.target == document.getElementById("createTechModal")) {
      document.getElementById("createTechModal").style.display = "none";
      document.getElementById("techCreateForm").reset();
    }
  });

  const createForm = document.getElementById("createForm");
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
      const response = await fetch(SERVICES.startups.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStartup),
      });

      if (!response.ok)
        throw new Error(
          "Error al crear la startup o el nombre es un duplicado"
        );

      alert("Startup creada correctamente.");
      document.getElementById("createModal").style.display = "none";
      createForm.reset();
      startupsLink.click();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al crear la startup o el nombre esta duplicado.");
    }
  });

  const techCreateForm = document.getElementById("techCreateForm");
  techCreateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = techCreateForm.nombre.value.trim();
    const sector = techCreateForm.sector.value.trim();
    const descripcion = techCreateForm.descripcion.value.trim();
    const categoria = techCreateForm.categoria.value.trim();
    const nivelAdopcion = techCreateForm.nivelAdopcion.value.trim();
    const fechaIntroduccion = techCreateForm.fechaIntroduccion.value;

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

    const newTechnology = {
      nombre,
      sector,
      descripcion,
      categoria,
      nivelAdopcion,
      fechaIntroduccion,
    };

    try {
      const response = await fetch(SERVICES.technologies.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTechnology),
      });

      if (!response.ok)
        throw new Error(
          "Error al crear la technology o es un nombre duplicado"
        );

      alert("Technology creada correctamente.");
      document.getElementById("createTechModal").style.display = "none";
      techCreateForm.reset();
      technologiesLink.click();
    } catch (error) {
      console.error(error);
      alert(
        "Hubo un error al crear la technology o el nombre puede ser un duplicado."
      );
    }
  });

  filterForm.style.display = "none";
  filterFormTech.style.display = "none";
  createStartupBtn.style.display = "none";
  createTechnologyBtn.style.display = "none";
});
