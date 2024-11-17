// public/technologies.js

document.addEventListener("DOMContentLoaded", () => {
  const technologiesLink = document.getElementById("technologies-link");
  const cardsContainer = document.getElementById("cards-container");
  const sectionTitle = document.getElementById("section-title");

  // Modal Elements
  const techEditModal = document.getElementById("editTechModal");
  const closeTechEditButton = document.querySelector(".close-tech-edit-button");
  const techEditForm = document.getElementById("techEditForm");
  const techCreateForm = document.getElementById("techCreateForm");
  const techCreateModal = document.getElementById("createTechModal");

  // Botón Crear Technology y Botón Cerrar Modal de Creación
  const createTechnologyBtn = document.getElementById("create-technology-btn");
  const closeTechCreateButton = document.querySelector(
    ".close-tech-create-button"
  );

  // URLs de las rutas del backend para Technologies
  const READ_TECH_SERVICE_URL =
    "https://readtechnologiesservice.onrender.com/api/technologies/read";
  const DELETE_TECH_SERVICE_URL =
    "https://deletetechnologyservice.onrender.com/api/technologies/delete";
  const UPDATE_TECH_SERVICE_URL =
    "https://updatetechnologyservice.onrender.com/api/technologies/update";
  const CREATE_TECH_SERVICE_URL =
    "https://createtechnologyservice.onrender.com/api/technologies/create";

  // Evento para leer Technologies
  technologiesLink.addEventListener("click", async (e) => {
    e.preventDefault();
    sectionTitle.textContent = "Technologies";
    cardsContainer.innerHTML = "<p>Cargando...</p>";

    try {
      const response = await fetch(READ_TECH_SERVICE_URL);
      if (!response.ok) {
        throw new Error("Error al obtener las technologies");
      }
      const data = await response.json();
      console.log("Datos recibidos de la API:", data);
      renderTechnologies(data.technologies);
    } catch (error) {
      console.error(error);
      cardsContainer.innerHTML = "<p>Error al cargar las technologies.</p>";
    }
  });

  // Función para renderizar Technologies como tarjetas
  function renderTechnologies(technologies) {
    cardsContainer.innerHTML = "";
    technologies.forEach((tech) => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
          <h3>${tech.nombre}</h3>
          <p><strong>Sector:</strong> ${tech.sector}</p>
          <p><strong>Descripción:</strong> ${tech.descripcion}</p>
          <p><strong>Categoría:</strong> ${tech.categoria}</p>
          <p><strong>Nivel de Adopción:</strong> ${
            tech.nivelAdopcion.charAt(0).toUpperCase() +
            tech.nivelAdopcion.slice(1)
          }</p>
          <p><strong>Fecha de Introducción:</strong> ${formatDate(
            tech.fechaIntroduccion
          )}</p>
          <div class="buttons">
            <button class="edit-tech-btn" data-id="${tech._id}">Editar</button>
            <button class="delete-tech-btn" data-id="${
              tech._id
            }">Eliminar</button>
          </div>
        `;

      cardsContainer.appendChild(card);
    });

    // Añadir eventos a los botones de eliminar y editar
    document.querySelectorAll(".delete-tech-btn").forEach((button) => {
      button.addEventListener("click", handleTechDelete);
    });

    document.querySelectorAll(".edit-tech-btn").forEach((button) => {
      button.addEventListener("click", handleTechEdit);
    });
  }

  // Función para formatear fechas
  function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return "Fecha inválida";
    return date.toLocaleDateString();
  }

  // Manejar la eliminación de una Technology
  async function handleTechDelete(e) {
    const techId = e.target.getAttribute("data-id");
    const confirmDelete = confirm(
      "¿Estás seguro de que quieres eliminar esta technology?"
    );

    if (confirmDelete) {
      try {
        const response = await fetch(`${DELETE_TECH_SERVICE_URL}/${techId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _id: techId }), // Asegúrate de enviar _id
        });

        if (!response.ok) {
          throw new Error("Error al eliminar la technology");
        }

        const result = await response.json();
        alert(result.message || "Technology eliminada correctamente.");
        // Recargar las technologies
        technologiesLink.click();
      } catch (error) {
        console.error(error);
        alert("Hubo un error al eliminar la technology.");
      }
    }
  }

  // Manejar la edición de una Technology
  function handleTechEdit(e) {
    const techId = e.target.getAttribute("data-id");
    // Obtener los datos de la technology actual
    const card = e.target.closest(".card");
    const nombre = card.querySelector("h3").textContent;
    const sector = card
      .querySelector("p:nth-child(2)")
      .textContent.replace("Sector: ", "");
    const descripcion = card
      .querySelector("p:nth-child(3)")
      .textContent.replace("Descripción: ", "");
    const categoria = card
      .querySelector("p:nth-child(4)")
      .textContent.replace("Categoría: ", "");
    const nivelAdopcion = card
      .querySelector("p:nth-child(5)")
      .textContent.replace("Nivel de Adopción: ", "");

    // Rellenar el formulario del modal con los datos actuales
    techEditForm.nombre.value = nombre;
    techEditForm.sector.value = sector;
    techEditForm.descripcion.value = descripcion;
    techEditForm.categoria.value = categoria;
    techEditForm.nivelAdopcion.value = nivelAdopcion.toLowerCase(); // Asegurarse de que coincida con los valores del select
    techEditForm.techId.value = techId;

    // Mostrar el modal
    techEditModal.style.display = "block";
  }

  // Cerrar el modal al hacer clic en la "X" del Editar Technology
  closeTechEditButton.addEventListener("click", () => {
    techEditModal.style.display = "none";
    techEditForm.reset();
  });

  // Cerrar el modal al hacer clic fuera del contenido del modal de Editar Technology
  window.addEventListener("click", (event) => {
    if (event.target == techEditModal) {
      techEditModal.style.display = "none";
      techEditForm.reset();
    }
  });

  // Manejar la sumisión del formulario de edición de Technology
  techEditForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const techId = techEditForm.techId.value;
    const nombre = techEditForm.nombre.value.trim();
    const sector = techEditForm.sector.value.trim();
    const descripcion = techEditForm.descripcion.value.trim();
    const categoria = techEditForm.categoria.value.trim();
    const nivelAdopcion = techEditForm.nivelAdopcion.value.trim();

    // Validaciones básicas
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
        throw new Error("Error al actualizar la technology");
      }

      const result = await response.json();
      alert("Technology actualizada correctamente.");
      // Cerrar el modal y recargar las technologies
      techEditModal.style.display = "none";
      techEditForm.reset();
      technologiesLink.click();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al actualizar la technology.");
    }
  });

  // Abrir el modal de Crear Technology al hacer clic en el botón
  createTechnologyBtn.addEventListener("click", () => {
    techCreateModal.style.display = "block";
  });

  // Cerrar el modal de Crear Technology al hacer clic en la "X"
  closeTechCreateButton.addEventListener("click", () => {
    techCreateModal.style.display = "none";
    techCreateForm.reset();
  });

  // Cerrar el modal de Crear Technology al hacer clic fuera del contenido del modal
  window.addEventListener("click", (event) => {
    if (event.target == techCreateModal) {
      techCreateModal.style.display = "none";
      techCreateForm.reset();
    }
  });

  // Manejar la sumisión del formulario de creación de Technology
  techCreateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = techCreateForm.nombre.value.trim();
    const sector = techCreateForm.sector.value.trim();
    const descripcion = techCreateForm.descripcion.value.trim();
    const categoria = techCreateForm.categoria.value.trim();
    const nivelAdopcion = techCreateForm.nivelAdopcion.value.trim();
    const fechaIntroduccion = techCreateForm.fechaIntroduccion.value;

    // Validaciones básicas
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
        throw new Error("Error al crear la technology");
      }

      const result = await response.json();
      alert("Technology creada correctamente.");
      // Cerrar el modal y recargar las technologies
      techCreateModal.style.display = "none";
      techCreateForm.reset();
      technologiesLink.click();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al crear la technology.");
    }
  });
});
